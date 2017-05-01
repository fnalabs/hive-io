import Router from 'koa-router';

const PROJECTION = Symbol('reference for query db connection object');


export default class ProjectionRouter extends Router {

    constructor(Projection) {
        super();

        this[PROJECTION] = Projection;

        this
            .get('/:id', this.getProjection)
            .get('/', this.getAllProjection);
    }

    getProjection = async ctx => {
        const id = ctx.params.id;

        // check if 'id' is a Value Object
        const queryHash = this[PROJECTION].schema.paths['id.id'] ? { 'id.id': id } : { id };

        try {
            const projection = await this[PROJECTION].findOne(queryHash).exec();

            if (!projection) { ctx.status = 204; }

            return ctx.body = projection;
        }
        catch (e) {
            console.log(e);

            return ctx.status = 400;
        }
    }

    getAllProjection = async ctx => {
        try {
            const projections = await this[PROJECTION].find().exec();

            if (!projections.length) { ctx.status = 204; }

            return ctx.body = projections;
        }
        catch (e) {
            console.log(e);

            return ctx.status = 400;
        }
    }

}

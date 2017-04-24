import Router from 'koa-router';

const MODEL = Symbol('reference for query db connection object');


export default class ProjectionRouter extends Router {

    constructor(Model) {
        super();

        this[MODEL] = Model;

        this
            .get('/:id', this.getProjection)
            .get('/', this.getAllProjection);
    }

    getProjection = async (ctx, next) => {
        const id = ctx.params.id;

        try {
            const model = await this[MODEL].findOne({ id }).exec();

            if (!model) { ctx.status = 204; }

            return ctx.body = model;
        }
        catch (error) {
            return next();
        }
    }

    getAllProjection = async (ctx, next) => {
        try {
            const models = await this[MODEL].find().exec();

            if (!models.length) { ctx.status = 204; }

            return ctx.body = models;
        }
        catch (error) {
            return next();
        }
    }

}

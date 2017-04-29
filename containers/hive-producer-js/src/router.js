import Router from 'koa-router';

const MODEL = Symbol('reference for Model class');
const STORE = Symbol('reference for Event Store connection object');


export default class ModelRouter extends Router {

    constructor(Model, store) {
        super();

        this[MODEL] = Model;
        this[STORE] = store;

        this.post('/', this.postModel);
    }

    postModel = async ctx => {
        const data = ctx.request.body;

        try {
            const model = new this[MODEL](data);

            await this[STORE].log(model);

            ctx.status = 200;
            return ctx.body = { ...model };
        }
        catch (e) {
            console.log(e);

            return ctx.status = 400;
        }
    }

}

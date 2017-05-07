import Router from 'koa-router';

const AGGREGATE = Symbol('reference for Aggregate class');
const HANDLERS = Symbol('namespace for event handlers');
const REPOSITORY = Symbol('reference for repository connection object');


export default class CommandRouter extends Router {

    constructor(Aggregate, handlers, repository) {
        super();

        this[AGGREGATE] = Aggregate;
        this[HANDLERS] = handlers;
        this[REPOSITORY] = repository;

        this.post('/', this.postCommand);
    }

    postCommand = async ctx => {
        const data = ctx.request.body;

        try {
            const aggregate = await this[REPOSITORY]
                .get(this[REPOSITORY].getKey(data, this[AGGREGATE].name), this[AGGREGATE]);
            const event = this[HANDLERS][data.name].handle(data, aggregate);

            await this[REPOSITORY].record(event, aggregate);

            ctx.status = 200;
            return ctx.body = { ...event };
        }
        catch (e) {
            console.log(e);

            return ctx.status = 400;
        }
    }

}

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

        this.post('/', this.postHandler);
    }

    postHandler = async (ctx, next) => {
        const commandData = ctx.request.body;

        try {
            const aggregate = (/^create/i).test(commandData.name) ?
                await this[REPOSITORY].get(commandData.id, this[AGGREGATE]) :
                this[REPOSITORY].create(commandData.id, this[AGGREGATE]);

            const event = this[HANDLERS][commandData.name].handle(commandData, aggregate);
            await this[REPOSITORY].record(event);

            ctx.status = 200;
            return ctx.body = { id: event.id };
        }
        catch (e) {
            return next();
        }
    }

}

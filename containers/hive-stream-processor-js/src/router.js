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

    postCommand = async (ctx, next) => {
        const commandData = ctx.request.body;

        try {
            const aggregate = (/^create/i).test(commandData.name) ?
                this[REPOSITORY].create(commandData, this[AGGREGATE]) :
                await this[REPOSITORY].get(commandData.id, this[AGGREGATE]);

            const event = this[HANDLERS][commandData.name].handle(commandData, aggregate);
            await this[REPOSITORY].record(event, aggregate);

            ctx.status = 200;
            return ctx.body = { ...event };
        }
        catch (e) {
            return next();
        }
    }

}

import CONFIG from '../conf/appConfig';

// imports
import Koa from 'koa';
import Router from 'koa-router';

import bodyparser from 'koa-bodyparser';
import cors from 'kcors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';

import CommandRouter from './router';
import EventObserver from './observer';
import EventStore from './store';
import Repository from './repository';

// init app
const aggregate = require(CONFIG.AGGREGATE_LIB)[CONFIG.AGGREGATE];

const store = new EventStore();
const repository = new Repository(store);

const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

// bootstrap event observer
if (/^(consumer|stream_processor)$/.test(CONFIG.PROCESSOR_TYPE)) {
    const observer = new EventObserver(aggregate.default, repository, store); // eslint-disable-line no-unused-vars
}

// bootstrap app
app
    .use(logger())
    .use(bodyparser())
    .use(cors())
    .use(helmet())
    .use(helmet.noCache())
    .use(helmet.referrerPolicy())

    // healthcheck router
    .use(healthRouter.routes())
    .use(healthRouter.allowedMethods());

// if Stream Processor type is either producer/stream_processor, init and attach CommandRouter to app
if (/^(producer|stream_processor)$/.test(CONFIG.PROCESSOR_TYPE)) {
    const commandRouter = new CommandRouter(aggregate.default, aggregate.handlers, repository);

    app.use(commandRouter.routes()).use(commandRouter.allowedMethods());
}

// handle error response for all other requests
app
    // TODO: 404 requests need to be integrated with log stream
    .use(async ctx => {
        return ctx.status = 404;
    })

    // log any errors that occurred
    // TODO: errors need to be integrated with log stream
    .on('error', err => {
        console.log(err);
    });


export default app;

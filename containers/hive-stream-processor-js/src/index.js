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

const aggregate = require(CONFIG.AGGREGATE_LIB)[CONFIG.AGGREGATE];

const store = new EventStore();
const repository = new Repository(store);

const commandRouter = new CommandRouter(aggregate.default, aggregate.handlers, repository);
const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

// bootstrap event observer
const observer = new EventObserver(aggregate.default, repository); // eslint-disable-line no-unused-vars

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
    .use(healthRouter.allowedMethods())

    // main router
    .use(commandRouter.routes())
    .use(commandRouter.allowedMethods())

    // handle error response for all other requests
    .use(async ctx => {
        return ctx.status = 404;
    })

    // log any errors that occurred
    // NOTE: errors need to be integrated with log stream
    .on('error', err => {
        console.log(err);
    });


export default app;

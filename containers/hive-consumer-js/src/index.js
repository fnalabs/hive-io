import CONFIG from '../conf/appConfig';

// imports
import Koa from 'koa';
import Router from 'koa-router';

import bodyparser from 'koa-bodyparser';
import cors from 'kcors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';

import ProjectionRouter from './router';
import EventObserver from './observer';
import EventStore from './store';

// init app
const projection = require(CONFIG.PROJECTION_LIB)[CONFIG.PROJECTION];
const model = require(CONFIG.MODEL_LIB)[CONFIG.MODEL];

const store = new EventStore();

const projectionRouter = new ProjectionRouter(model);
const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

// bootstrap event observer
const observer = new EventObserver(projection.default, model, store); // eslint-disable-line no-unused-vars

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

    .use(projectionRouter.routes())
    .use(projectionRouter.allowedMethods())

    // handle error response for all other requests
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

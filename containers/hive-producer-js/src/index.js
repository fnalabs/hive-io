import CONFIG from '../conf/appConfig';

// imports
import Koa from 'koa';
import Router from 'koa-router';

import bodyparser from 'koa-bodyparser';
import cors from 'kcors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';

import ModelRouter from './router';
import EventStore from './store';

// init app
const model = require(CONFIG.MODEL_LIB).domain.model[CONFIG.MODEL];

const store = new EventStore();

const modelRouter = new ModelRouter(model, store);
const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

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

    // model router
    .use(modelRouter.routes())
    .use(modelRouter.allowedMethods())

    // handle error response for all other requests
    .use(async ctx => {
        return ctx.status = 404;
    })

    // log any errors that occurred
    .on('error', err => {
        console.log(err);
    });


export default app;

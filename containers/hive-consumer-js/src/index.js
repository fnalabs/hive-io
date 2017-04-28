import CONFIG from '../conf/appConfig';
import mongoose, { model } from 'mongoose';

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
const aggregate = require(CONFIG.AGGREGATE_LIB).domain.aggregate[CONFIG.AGGREGATE];
const ProjectionSchema = require(CONFIG.PROJECTION_LIB).projection[CONFIG.PROJECTION];

const projection = model.call(mongoose, CONFIG.PROJECTION, new ProjectionSchema());
const store = new EventStore();

const projectionRouter = new ProjectionRouter(projection);
const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

// bootstrap event observer
const observer = new EventObserver(aggregate.default, projection, store); // eslint-disable-line no-unused-vars

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

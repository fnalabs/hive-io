import CONFIG from '../conf/appConfig';

// imports
import Koa from 'koa';
import Router from 'koa-router';

import bodyparser from 'koa-bodyparser';
import cors from 'kcors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';

import mongoose, { model } from 'mongoose';

import ProjectionRouter from './router';
import EventObserver from './observer';
import EventStore from './store';

// init app
const denormalizer = require(CONFIG.DENORMALIZER_LIB).projection.denormalizer[CONFIG.DENORMALIZER];
const ProjectionSchema = require(CONFIG.PROJECTION_LIB).projection.store[CONFIG.PROJECTION];

const projection = model.call(mongoose, CONFIG.PROJECTION, new ProjectionSchema());
const store = new EventStore();

const projectionRouter = new ProjectionRouter(projection);
const healthRouter = new Router().get('/health', ctx => ctx.status = 200);
const app = new Koa();

// bootstrap event observer
const observer = new EventObserver(denormalizer, projection, store); // eslint-disable-line no-unused-vars

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
    .use(async ctx => {
        return ctx.status = 404;
    })

    // log any errors that occurred
    .on('error', err => {
        console.log(err);
    });


export default app;

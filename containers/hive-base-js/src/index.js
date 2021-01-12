// imports
import {
  ACTOR,
  ACTOR_LIB,
  ACTOR_URLS,
  HTTP_VERSION,
  PING_URL,
  SECURE,
  TELEMETRY,
  TELEMETRY_LIB_NAME,
  TELEMETRY_LIB_VERSION
} from './config'
import './telemetry'

import cors from 'fastify-cors'
import helmet from 'fastify-helmet'
import { context, propagation, trace, SpanKind, StatusCode, ROOT_CONTEXT } from '@opentelemetry/api'
import { HttpAttribute } from '@opentelemetry/semantic-conventions'

// constants
const flavor = HTTP_VERSION === 2 ? '2.0' : '1.1'
const spanMap = new WeakMap()
const spanNamePrefix = `hive^io - ${HTTP_VERSION === 2 ? 'HTTP/2' : SECURE ? 'HTTPS' : 'HTTP'}`
const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)
let actor

/**
 * onRequest hook to create span
 */
export function onRequestHook (request, reply, done) {
  if (request.url === PING_URL) return done()

  const spanName = `${spanNamePrefix} - ${request.method} - ${request.routerPath}`
  if (tracer.getCurrentSpan()) {
    const span = tracer.startSpan(spanName, { kind: SpanKind.SERVER })
    spanMap.set(request, span)
    return done()
  }

  context.with(propagation.extract(ROOT_CONTEXT, request.raw.headers), () => {
    const span = tracer.startSpan(spanName, {
      kind: SpanKind.SERVER,
      attributes: {
        [HttpAttribute.HTTP_FLAVOR]: flavor,
        [HttpAttribute.HTTP_URL]: request.url,
        [HttpAttribute.HTTP_METHOD]: request.method,
        [HttpAttribute.HTTP_ROUTE]: request.routerPath,
        [HttpAttribute.HTTP_STATUS_CODE]: 200
      }
    })
    if (request.headers['user-agent']) {
      span.setAttribute(HttpAttribute.HTTP_USER_AGENT, request.headers['user-agent'])
    }
    span.setStatus({ code: StatusCode.OK })
    spanMap.set(request, span)

    tracer.withSpan(span, () => {
      context.bind(request.raw)
      context.bind(reply.raw)

      done()
    })
  })
}

/**
 * onError hook to update HTTP_STATUS_CODE for current request span
 */
export function onErrorHook (request, reply, error, done) {
  if (!spanMap.has(request)) return done()

  const statusCode = (reply.statusCode || error.statusCode) ?? 400

  const span = spanMap.get(request)
  span.setAttributes({
    [HttpAttribute.HTTP_STATUS_CODE]: statusCode,
    'error.name': error.name,
    'error.message': error.message,
    'error.stack': error.stack
  })
  span.setStatus({ code: StatusCode.ERROR })

  done()
}

/**
 * onResponse hook to end span
 */
export function onResponseHook (request, _, done) {
  if (!spanMap.has(request)) return done()

  spanMap.get(request).end()
  spanMap.delete(request)

  done()
}

/**
 * handler to return OK for health checks
 */
export function healthHandler () {
  return 'OK'
}

/**
 * handler for routing requests and translating incoming JSON data
 */
export async function mainHandler (request) {
  const span = tracer.startSpan('hive^io - request handler', { kind: SpanKind.SERVER })

  // construct standard action from referencing request body
  const action = {}
  if (request.body) {
    if (request.body.type) {
      span.addEvent('processing FSA start')

      // assign standard action references
      action.type = request.body.type
      action.payload = request.body.payload ?? {}
      action.meta = request.body.meta
        ? { meta: request.body.meta, request }
        : { request }

      span.addEvent('processing FSA end')
    } else {
      span.addEvent('processing JSON start')

      // assign non-standard request body to action
      action.payload = request.body.payload ?? request.body
      action.meta = { request }

      span.addEvent('processing JSON end')
    }
  } else {
    action.meta = { request }
  }

  try {
    // call Actor to perform on request
    span.addEvent('actor.perform start')
    const { model } = await actor.perform(undefined, action)
    span.addEvent('actor.perform end')
    span.setStatus({ code: StatusCode.OK })
    span.end()

    return model
  } catch (error) {
    span.setStatus({ code: StatusCode.ERROR })
    span.end()

    throw error
  }
}

/**
 * initializes service with optional telemetry hooks
 */
export default async function main (fastify) {
  // init Actor
  const Actor = await require(ACTOR_LIB)[ACTOR]
  actor = await new Actor()

  // add hooks for telemetry if enabled
  if (TELEMETRY) {
    fastify.addHook('onRequest', onRequestHook)
    fastify.addHook('onError', onErrorHook)
    fastify.addHook('onResponse', onResponseHook)
  }

  // register plugins
  fastify.register(cors)
  fastify.register(helmet)

  // set routes
  fastify.get(PING_URL, healthHandler)
  for (const url of ACTOR_URLS) {
    fastify.all(url, mainHandler)
  }

  return fastify
}

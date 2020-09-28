// imports
import { ACTOR, ACTOR_LIB, ACTOR_URLS, PING_URL, PROCESSOR_TYPE } from './config'

import cors from 'fastify-cors'
import helmet from 'fastify-helmet'

import EventStore from './store'
import Repository from './repository'

let actor
let repository
let store

// constants
const isConsumer = PROCESSOR_TYPE === 'consumer'
const isProducer = PROCESSOR_TYPE === 'producer'
const isStreamProcessor = PROCESSOR_TYPE === 'stream_processor'

// helper functions
export async function consumeHandler ({ message }) {
  const value = JSON.parse(message.value)

  let aggModel
  const cache = await repository.get(value.id)
  if (cache) aggModel = await actor.replay(JSON.parse(cache)).model

  const { meta, model } = await actor.perform(aggModel, value)
  if (isConsumer) await repository.update(model)
  if (isStreamProcessor) await store.record(meta, model)
}

export function healthHandler () {
  return 'OK'
}

export async function mainHandler (request) {
  // construct standard action from referencing request body
  const action = {}
  if (request.body) {
    if (request.body.type) {
      // assign standard action references
      action.type = request.body.type
      action.payload = request.body.payload ?? {}
      action.meta = request.body.meta
        ? { meta: request.body.meta, request }
        : { request }
    } else {
      // assign non-standard request body to action
      action.payload = request.body.payload ?? request.body
      action.meta = { request }
    }
  } else {
    action.meta = { request }
  }

  // call Actor to perform on request
  let aggModel
  const cache = await repository.get(action.meta.request.params.id)
  if (cache) {
    const aggregate = await actor.replay(JSON.parse(cache))
    aggModel = aggregate.model
  }

  const { meta, event, model } = await actor.perform(aggModel, action)
  await repository.record(meta, event, model, cache)

  return event
}

// export main
export default async function main (fastify) {
  // init dependencies
  const Actor = await require(ACTOR_LIB)[ACTOR]

  store = new EventStore()
  repository = new Repository(store)
  actor = await new Actor(repository)

  // bootstrap event observer
  if (isProducer || isStreamProcessor) await store.produce()
  if (isConsumer || isStreamProcessor) await store.consume(consumeHandler)

  fastify.register(cors)
  fastify.register(helmet)

  fastify.get(PING_URL, healthHandler)
  for (const url of ACTOR_URLS) {
    fastify.all(url, mainHandler)
  }

  return fastify
}

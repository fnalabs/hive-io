// imports
import { ACTOR, ACTOR_LIB, ACTOR_URLS, PING_URL } from './config'

import cors from 'fastify-cors'
import helmet from 'fastify-helmet'

let actor

// helper functions
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
  const { model } = await actor.perform(undefined, action)
  return model
}

// export main
export default async function main (fastify) {
  // init dependencies
  const Actor = await require(ACTOR_LIB)[ACTOR]
  actor = await new Actor()

  fastify.register(cors)
  fastify.register(helmet)

  fastify.get(PING_URL, healthHandler)

  for (const url of ACTOR_URLS) {
    fastify.all(url, mainHandler)
  }

  return fastify
}

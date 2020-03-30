// imports
import { ACTOR, ACTOR_LIB, PING_URL } from './config'

import EventStore from './store'

let actor

// constants
const pingUrlRegExp = new RegExp(`^${PING_URL}$`)

// helper functions
export function handleConsume ({ message }) {
  actor.perform(undefined, JSON.parse(message.value))
}

export function send (res, status = 200, model = null) {
  if (model === null) {
    res.writeHead(status, { 'Content-Type': 'text/plain' })
    res.end()
  } else {
    const str = JSON.stringify(model)

    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(str)
    })
    res.end(str)
  }
}

// export main
export default async function main () {
  // init dependencies
  const Actor = await require(ACTOR_LIB)[ACTOR]
  actor = await new Actor()

  // init event store to start consuming data
  const store = new EventStore()
  await store.consume(handleConsume)

  // router for microservice
  return async function route (req, res) {
    if (pingUrlRegExp.test(req.url)) return send(res)
    if (req.method !== 'GET') {
      return send(res, 405, {
        errors: [
          { message: 'Consumers only receive GET requests' }
        ]
      })
    }

    // copy common req public properties to data.meta for query processing
    const data = {
      meta: {
        req: {
          headers: {},
          method: req.method,
          url: req.url,
          urlParams: actor.parse(req.url)
        }
      }
    }
    const keys = Object.keys(req.headers)
    for (let i = 0, len = keys.length; i < len; i++) {
      data.meta.req.headers[keys[i]] = Array.isArray(req.headers[keys[i]])
        ? Array.from(req.headers[keys[i]])
        : req.headers[keys[i]]
    }

    try {
      const { model } = await actor.perform(undefined, data)

      return send(res, 200, model)
    } catch (e) {
      return send(res, e.statusCode || 400, { errors: [e.message] })
    }
  }
}

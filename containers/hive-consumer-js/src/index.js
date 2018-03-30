// imports
import { parse } from 'url'

import EventStore from './store'

// constants
const pingUrlRegexp = new RegExp('^/ping$')

// export main
export default async function main (CONFIG, micro) {
  const { send } = micro

  // init dependencies
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor()

  // init event store to start consuming data
  new EventStore(CONFIG, actor) // eslint-disable-line no-new

  // router for microservice
  async function route (req, res) {
    if (pingUrlRegexp.test(req.url)) return send(res, 200)
    if (req.method !== 'GET') return send(res, 405, 'Consumers only receive GET requests')

    // construct payload with parsed request data for query processing
    const payload = {
      meta: {
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }
    }

    try {
      const { model } = await actor.perform(payload)

      return send(res, 200, model)
    } catch (e) {
      return send(res, e.statusCode || 400, e)
    }
  }

  return micro(route)
}

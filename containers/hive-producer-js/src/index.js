// imports
import { parse } from 'url'

import EventStore from './store'

// constants
const pingUrlRegexp = new RegExp('^/ping$')

// export main
export default async function main (CONFIG, micro) {
  const { json, send } = micro

  // init dependencies
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor()
  const store = new EventStore(CONFIG)

  // router for microservice
  async function route (req, res) {
    if (pingUrlRegexp.test(req.url)) return send(res, 200)
    if (req.method !== 'POST') return send(res, 405, 'Producers only accept POST requests')

    try {
      // construct payload with parsed request data for query processing
      const payload = await json(req)
      payload.meta = {
        ...payload.meta,
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }

      const { id, model } = await actor.perform(payload)
      await store.log(id, model)

      console.info(`${req.method} '${payload.meta.model}' payload logged successfully at ${new Date().toJSON()}`)
      return send(res, 200, model)
    } catch (e) {
      console.error(e)
      return send(res, e.statusCode || 400, e)
    }
  }

  return micro(route)
}

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
    if (req.method === 'GET') {
      return send(res, 405, {errors: [
        {message: 'Producers don\'t accept GET requests'}
      ]})
    }

    try {
      // construct data with parsed request data for query processing
      let data = req.headers['content-type'] === 'application/json'
        ? await json(req)
        : {}

      // set payload if not previously set
      if (Object.keys(data).length && !(data.payload || data.meta)) {
        data = { payload: data }
      }

      // set meta with request data
      data.meta = {
        ...data.meta,
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }

      const { id, model } = await actor.perform(undefined, data)
      await store.log(id, model)

      return send(res, 200, model)
    } catch (e) {
      return send(res, e.statusCode || 400, {errors: [e.message]})
    }
  }

  return micro(route)
}

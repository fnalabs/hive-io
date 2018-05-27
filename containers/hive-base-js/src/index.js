// imports
import { parse } from 'url'

// constants
const pingUrlRegexp = new RegExp('^/ping$')

// export main
export default async function main (CONFIG, micro) {
  const { json, send } = micro

  // init dependencies
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor()

  // router for microservice
  async function route (req, res) {
    if (pingUrlRegexp.test(req.url)) return send(res, 200)

    try {
      // construct data with parsed request data for query processing
      const data = req.method === 'GET' ? {} : await json(req)
      data.meta = {
        ...data.meta || {},
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }

      const { model } = await actor.perform(undefined, data)

      return send(res, 200, model)
    } catch (e) {
      return send(res, e.statusCode || 400, {errors: [e]})
    }
  }

  return micro(route)
}

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
      // construct payload with parsed request data for query processing
      const payload = req.method === 'GET' ? {} : await json(req)
      payload.meta = {
        ...payload.meta || {},
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }

      const { model } = await actor.perform(payload)

      console.info(`${req.method} '${req.url}' payload processed successfully at ${new Date().toJSON()}`)
      return send(res, 200, model)
    } catch (e) {
      console.error(e)
      return send(res, e.statusCode || 400, e)
    }
  }

  return micro(route)
}

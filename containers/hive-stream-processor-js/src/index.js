// imports
import { parse } from 'url'

import EventObserver from './observer'
import EventStore from './store'
import Repository from './repository'

// constants
const pingUrlRegexp = new RegExp('^/ping$')

// export main
export default async function main (CONFIG, micro) {
  const { json, send } = micro
  const isConsumer = CONFIG.PROCESSOR_TYPE === 'consumer'
  const isProducer = CONFIG.PROCESSOR_TYPE === 'producer'

  // init dependencies
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor()
  const store = new EventStore(CONFIG)
  const repository = new Repository(CONFIG, store)

  // bootstrap event observer
  if (/^(consumer|stream_processor)$/.test(CONFIG.PROCESSOR_TYPE)) {
    new EventObserver(actor, repository, store, isConsumer) // eslint-disable-line no-new
  }

  // router for microservice
  async function route (req, res) {
    if (pingUrlRegexp.test(req.url)) return send(res, 200)

    // if Stream Processor type is consumer, return 400
    if (!isProducer) return send(res, 400)

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

      const aggregate = await actor.replay(payload, repository)
      const { id, event, model } = await actor.perform(payload, aggregate, repository)
      await repository.record(id, event, model)

      /* istanbul ignore if */
      if (CONFIG.NODE_ENV === 'development') console.log(`'${payload.meta.model}' payload logged successfully at ${new Date().toJSON()}`)
      return send(res, 200, event)
    } catch (e) {
      /* istanbul ignore if */
      if (CONFIG.NODE_ENV === 'development') console.log(e)
      return send(res, 400, e)
    }
  }

  return micro(route)
}

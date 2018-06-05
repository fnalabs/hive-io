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
  const store = new EventStore(CONFIG)
  const repository = new Repository(CONFIG, store)
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor(repository)

  // bootstrap event observer
  if (/^(consumer|stream_processor)$/.test(CONFIG.PROCESSOR_TYPE)) {
    new EventObserver(actor, repository, store, isConsumer) // eslint-disable-line no-new
  }

  // router for microservice
  async function route (req, res) {
    if (pingUrlRegexp.test(req.url)) return send(res, 200)

    // if Stream Processor type is consumer, return 400
    if (!isProducer) {
      return send(res, 400, {errors: [
        {message: 'This Stream Processor is deployed as a Consumer only'}
      ]})
    }
    if (req.method === 'GET') {
      return send(res, 405, {errors: [
        {message: 'Stream Processors don\'t accept GET requests'}
      ]})
    }

    try {
      // construct data with parsed request data for query processing
      const data = await json(req)
      data.meta = {
        ...data.meta,
        headers: { ...req.headers },
        method: req.method,
        url: parse(req.url, true),
        urlParams: actor.parse(req.url)
      }

      const aggregate = await actor.replay(data)
      const { id, event, model } = await actor.perform(aggregate.model, data)
      await repository.record(id, event, model)

      return send(res, 200, event)
    } catch (e) {
      return send(res, e.statusCode || 400, {errors: [e]})
    }
  }

  return micro(route)
}

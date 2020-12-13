// imports
import { Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'
import LogSystem from '../../systems/LogSystem'

import ContentId from '../../schemas/json/ContentId.json'
import ViewSchema from '../../schemas/json/View.json'
import MongoSchema from '../../schemas/mongoose/Content'

import { propagation, trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-base-js')

// private properties
const LOG_SYSTEM = Symbol('Log System')
const VIEW_SCHEMA = Symbol('View schema')

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentId
}

/*
 * class ContentQueryActor
 */
class ContentQueryActor extends Actor {
  constructor (logSystem, viewSchema, repository) {
    super(undefined, repository)

    Object.defineProperties(this, {
      [LOG_SYSTEM]: { value: logSystem },
      [VIEW_SCHEMA]: { value: viewSchema }
    })
  }

  async perform (_model, action) {
    if (action.meta.request.method !== 'GET') throw new TypeError('Content values can only be queried from this endpoint')

    const span = tracer.startSpan('ContentQueryActor.perform')

    const { id } = action.meta.request.params

    const model = id
      ? await this.repository.findOne({ _id: id }).exec()
      : await this.repository.find().exec()

    // emit 'view' to count
    if (id) {
      const view = await new Model({ type: 'View', payload: { id } }, this[VIEW_SCHEMA])
      propagation.inject(view)
      this[LOG_SYSTEM].emit(view)
    }

    span.end()
    return { model }
  }
}

/*
 * Proxy<ContentQueryActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(ContentQueryActor, {
  construct: async function (ContentQueryActor) {
    const repository = await mongoConnect()
    const model = repository.model('Content', new MongoSchema())

    const logSystem = await new LogSystem()
    const viewSchema = await new Schema(ViewSchema, REFS)

    return new ContentQueryActor(logSystem, viewSchema, model)
  }
})

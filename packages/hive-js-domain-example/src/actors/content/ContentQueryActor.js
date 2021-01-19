// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { context, propagation, trace, StatusCode } from '@opentelemetry/api'
import { Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'
import LogSystem from '../../systems/LogSystem'

import ContentId from '../../schemas/json/ContentId.json'
import ViewSchema from '../../schemas/json/View.json'
import MongoSchema from '../../schemas/mongoose/Content'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

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

    try {
      const model = id
        ? await this.repository.findOne({ _id: id }).exec()
        : await this.repository.find().exec()

      // emit 'view' to count
      if (id) {
        const view = await new Model({ type: 'View', payload: { id } }, this[VIEW_SCHEMA])
        propagation.inject(context.active(), view)
        this[LOG_SYSTEM].emit(view)
      }
      span.setStatus({ code: StatusCode.OK })
      span.end()

      return { model }
    } catch (error) {
      span.setStatus({ code: StatusCode.ERROR })
      span.end()

      throw error
    }
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

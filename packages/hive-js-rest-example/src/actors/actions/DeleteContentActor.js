// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION, UPDATE_OPTIONS } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

/*
 * class DeleteContentActor
 */
class DeleteContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('DeleteContentActor.perform')

    // upload to mongo
    const conditions = { _id: action.meta.request.params.id }
    const update = { $set: { enabled: false } }

    try {
      model = await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()
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
 * Proxy<DeleteContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(DeleteContentActor, {
  construct: async function (DeleteContentActor, argsList) {
    const repository = argsList[0]
    const contentSchema = await new Schema(ContentSchema)
    return new DeleteContentActor(contentSchema, repository)
  }
})

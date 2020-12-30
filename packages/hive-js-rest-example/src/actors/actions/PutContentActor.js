// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION, UPDATE_OPTIONS } from '../../config'

import { StatusCode, trace } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

/*
 * class PutContentActor
 */
class PutContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('PutContentActor.perform')

    try {
      // validate
      await super.perform(model, action)

      // prepare upload params
      const conditions = { _id: action.meta.request.params.id }
      const update = { $set: { text: action.payload.text, edited: true } }

      // upload to mongo
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
 * Proxy<PutContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PutContentActor, {
  construct: async function (PutContentActor, argsList) {
    const repository = argsList[0]
    const contentSchema = await new Schema(ContentSchema)
    return new PutContentActor(contentSchema, repository)
  }
})

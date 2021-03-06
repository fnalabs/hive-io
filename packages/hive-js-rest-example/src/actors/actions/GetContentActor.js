// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

/*
 * class GetContentActor
 */
class GetContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('GetContentActor.perform')

    const _id = action.meta.request.params.id
    const conditions = { _id }
    const update = { $inc: { viewed: 1 } }

    try {
      model = typeof _id === 'string'
        ? await this.repository.findOneAndUpdate(conditions, update).exec()
        : await this.repository.find().exec()
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
 * Proxy<GetContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(GetContentActor, {
  construct: async function (GetContentActor, argsList) {
    const repository = argsList[0]
    const contentSchema = await new Schema(ContentSchema)
    return new GetContentActor(contentSchema, repository)
  }
})

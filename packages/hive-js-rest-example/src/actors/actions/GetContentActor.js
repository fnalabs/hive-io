// imports
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-base-js')

/*
 * class GetContentActor
 */
class GetContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('GetContentActor.perform')

    const _id = action.meta.request.params.id
    const conditions = { _id }
    const update = { $inc: { viewed: 1 } }

    model = typeof _id === 'string'
      ? await this.repository.findOneAndUpdate(conditions, update).exec()
      : await this.repository.find().exec()

    span.end()
    return { model }
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

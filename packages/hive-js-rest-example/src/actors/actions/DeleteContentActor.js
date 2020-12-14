// imports
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

import { UPDATE_OPTIONS } from '../../config'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-base-js')

/*
 * class DeleteContentActor
 */
class DeleteContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('DeleteContentActor.perform')

    // upload to mongo
    const conditions = { _id: action.meta.request.params.id }
    const update = { $set: { enabled: false } }

    model = await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()

    span.end()
    return { model }
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

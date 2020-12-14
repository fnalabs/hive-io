// imports
import { UPDATE_OPTIONS } from '../../config'

import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-base-js')

/*
 * class PutContentActor
 */
class PutContentActor extends Actor {
  async perform (model, action) {
    const span = tracer.startSpan('PutContentActor.perform')

    // validate
    await super.perform(model, action)

    // prepare upload params
    const conditions = { _id: action.meta.request.params.id }
    const update = { $set: { text: action.payload.text, edited: true } }

    // upload to mongo
    model = await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()

    span.end()
    return { model }
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

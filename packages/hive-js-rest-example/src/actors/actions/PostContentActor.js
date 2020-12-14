// imports
import { v4 as uuidV4 } from 'uuid'
import { Actor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-base-js')

/*
 * class PostContentActor
 */
class PostContentActor extends Actor {
  async perform (model, action, parent) {
    const span = tracer.startSpan('PostContentActor.perform', { parent })

    const Model = this.repository

    // validate
    await super.perform(model, action)

    // upload to mongo
    const content = { _id: uuidV4(), text: action.payload.text }
    model = await new Model(content).save()

    span.end()
    return { model }
  }
}

/*
 * Proxy<PostContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostContentActor, {
  construct: async function (PostContentActor, argsList) {
    const repository = argsList[0]
    const contentSchema = await new Schema(ContentSchema)
    return new PostContentActor(contentSchema, repository)
  }
})

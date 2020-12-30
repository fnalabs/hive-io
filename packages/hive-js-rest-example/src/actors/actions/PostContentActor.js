// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'
import { v4 as uuidV4 } from 'uuid'

import ContentSchema from '../../schemas/json/Content.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

/*
 * class PostContentActor
 */
class PostContentActor extends Actor {
  async perform (model, action, parent) {
    const span = tracer.startSpan('PostContentActor.perform', { parent })

    const Model = this.repository

    try {
      // validate
      await super.perform(model, action)

      // upload to mongo
      const content = { _id: uuidV4(), text: action.payload.text }
      model = await new Model(content).save()
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
 * Proxy<PostContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostContentActor, {
  construct: async function (PostContentActor, argsList) {
    const repository = argsList[0]
    const contentSchema = await new Schema(ContentSchema)
    return new PostContentActor(contentSchema, repository)
  }
})

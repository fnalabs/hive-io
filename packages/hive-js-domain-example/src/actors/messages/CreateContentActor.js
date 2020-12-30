// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import CreateContentSchema from '../../schemas/json/commands/CreateContent.json'
import CreatedContentSchema from '../../schemas/json/events/CreatedContent.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema,
  'https://hiveframework.io/api/models/Text': TextSchema
}

/*
 * class CreateContentActor
 */
class CreateContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (typeof modelInst !== 'undefined') throw new Error(`#${action.type}: ${modelInst.id} already exists`)

    const span = tracer.startSpan('CreateContentActor.perform')

    try {
      const { command, event, model } = await super.perform(modelInst, action)

      model.enabled = true
      model.edited = false

      span.setStatus({ code: StatusCode.OK })
      span.end()

      return { meta: { key: model.id }, command, event, model }
    } catch (error) {
      span.setStatus({ code: StatusCode.ERROR })
      span.end()

      throw error
    }
  }
}

/*
 * Proxy<CreateContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(CreateContentActor, {
  construct: async function (CreateContentActor) {
    const postSchema = await new Schema(ContentSchema, REFS)
    const createdContentSchema = await new Schema(CreatedContentSchema, REFS)
    const createContentSchema = await new Schema(CreateContentSchema, REFS)

    return new CreateContentActor(createdContentSchema, createContentSchema, postSchema)
  }
})

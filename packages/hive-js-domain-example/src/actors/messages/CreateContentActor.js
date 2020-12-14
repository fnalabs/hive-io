// imports
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import CreateContentSchema from '../../schemas/json/commands/CreateContent.json'
import CreatedContentSchema from '../../schemas/json/events/CreatedContent.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-stream-processor-js')

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

    const { command, event, model } = await super.perform(modelInst, action)

    model.enabled = true
    model.edited = false

    span.end()
    return { meta: { key: model.id }, command, event, model }
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

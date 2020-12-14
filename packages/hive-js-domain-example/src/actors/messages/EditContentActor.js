// imports
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import EditContentSchema from '../../schemas/json/commands/EditContent.json'
import EditedContentSchema from '../../schemas/json/events/EditedContent.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-stream-processor-js')

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema,
  'https://hiveframework.io/api/models/Text': TextSchema
}

/*
 * class EditContentActor
 */
class EditContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (typeof modelInst === 'undefined') throw new Error(`#${action.type}: ${action.payload.id} doesn't exist`)

    const span = tracer.startSpan('EditContentActor.perform')

    const { command, event, model } = await super.perform(modelInst, action)

    model.edited = true

    span.end()
    return { meta: { key: model.id }, command, event, model }
  }
}

/*
 * Proxy<EditContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EditContentActor, {
  construct: async function (EditContentActor) {
    const postSchema = await new Schema(ContentSchema, REFS)
    const editedContentSchema = await new Schema(EditedContentSchema, REFS)
    const editContentSchema = await new Schema(EditContentSchema, REFS)

    return new EditContentActor(editedContentSchema, editContentSchema, postSchema)
  }
})

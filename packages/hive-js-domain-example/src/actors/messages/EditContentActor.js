// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, SpanKind, StatusCode } from '@opentelemetry/api'
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import EditContentSchema from '../../schemas/json/commands/EditContent.json'
import EditedContentSchema from '../../schemas/json/events/EditedContent.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

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
    const span = tracer.startSpan('EditContentActor.perform', { kind: SpanKind.SERVER })

    try {
      if (typeof modelInst === 'undefined') throw new Error(`#${action.type}: ${action.payload.id} doesn't exist`)

      const { command, event, model } = await super.perform(modelInst, action)

      model.edited = true

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

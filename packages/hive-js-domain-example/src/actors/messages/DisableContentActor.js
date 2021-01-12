// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, SpanKind, StatusCode } from '@opentelemetry/api'
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import DisabledContentSchema from '../../schemas/json/events/DisabledContent.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema,
  'https://hiveframework.io/api/models/Text': TextSchema
}

/*
 * class DisableContentActor
 */
class DisableContentActor extends MessageActor {
  async perform (modelInst, action) {
    const span = tracer.startSpan('DisableContentActor.perform', { kind: SpanKind.SERVER })

    try {
      if (modelInst.enabled === false) throw new Error('#DisableContent: content already disabled')

      const { command, event, model } = await super.perform(modelInst, action)

      model.enabled = false

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
 * Proxy<DisableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(DisableContentActor, {
  construct: async function (DisableContentActor) {
    const postSchema = await new Schema(ContentSchema, REFS)
    const disabledContentSchema = await new Schema(DisabledContentSchema, REFS)

    return new DisableContentActor(disabledContentSchema, undefined, postSchema)
  }
})

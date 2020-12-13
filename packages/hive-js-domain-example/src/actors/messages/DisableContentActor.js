// imports
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import DisabledContentSchema from '../../schemas/json/events/DisabledContent.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-stream-processor-js')

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
    if (modelInst.enabled === false) throw new Error('#DisableContent: content already disabled')

    const span = tracer.startSpan('DisableContentActor.perform')

    const { command, event, model } = await super.perform(modelInst, action)

    model.enabled = false

    span.end()
    return { meta: { key: model.id }, command, event, model }
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

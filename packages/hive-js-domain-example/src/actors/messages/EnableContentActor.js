// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { MessageActor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

import EnabledContentSchema from '../../schemas/json/events/EnabledContent.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema,
  'https://hiveframework.io/api/models/Text': TextSchema
}

/*
 * class EnableContentActor
 */
class EnableContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (modelInst.enabled === true) throw new Error('#EnableContent: content already enabled')

    const span = tracer.startSpan('EnableContentActor.perform')

    try {
      const { command, event, model } = await super.perform(modelInst, action)

      model.enabled = true

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
 * Proxy<EnableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EnableContentActor, {
  construct: async function (EnableContentActor) {
    const postSchema = await new Schema(ContentSchema, REFS)
    const enabledContentSchema = await new Schema(EnabledContentSchema, REFS)

    return new EnableContentActor(enabledContentSchema, undefined, postSchema)
  }
})

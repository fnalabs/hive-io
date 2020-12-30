// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, StatusCode } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ViewedContentSchema from '../../schemas/json/events/ViewedContent.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema
}

/*
 * class ViewContentActor
 */
class ViewContentActor extends Actor {
  async perform (_model, action) {
    const span = tracer.startSpan('ViewContentActor.perform')

    try {
      action.type = 'ViewedContent'
      action.payload = { id: action.meta.request.params.id }
      const { model } = await super.perform(_model, action)

      span.setStatus({ code: StatusCode.OK })
      span.end()
      // NOTE: return model as event since this Producer isn't exposed publicly
      return { meta: { key: model.id }, event: model }
    } catch (error) {
      span.setStatus({ code: StatusCode.ERROR })
      span.end()

      throw error
    }
  }
}

/*
 * Proxy<ViewContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(ViewContentActor, {
  construct: async function (ViewContentActor) {
    const viewedContentSchema = await new Schema(ViewedContentSchema, REFS)
    return new ViewContentActor(viewedContentSchema)
  }
})

// imports
import { Actor, Schema } from 'hive-io'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ViewedContentSchema from '../../schemas/json/events/ViewedContent.json'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-producer-js')

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

    action.type = 'ViewedContent'
    action.payload = { id: action.meta.request.params.id }
    const { model } = await super.perform(_model, action)

    span.end()
    // NOTE: return model as event since this Producer isn't exposed publicly
    return { meta: { key: model.id }, event: model }
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

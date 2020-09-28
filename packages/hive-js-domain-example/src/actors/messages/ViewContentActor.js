// imports
import { Actor, Schema } from 'hive-io'

import PostIdSchema from '../../schemas/json/PostId.json'
import ViewedContentSchema from '../../schemas/json/events/ViewedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class ViewContentActor
 */
class ViewContentActor extends Actor {
  async perform (_model, action) {
    action.type = 'ViewedContent'
    action.payload = { id: action.meta.request.params.id }
    const { model } = await super.perform(_model, action)

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

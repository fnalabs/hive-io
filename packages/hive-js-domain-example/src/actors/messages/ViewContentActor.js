// imports
import { parse, Actor, Schema } from 'hive-io'

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
  constructor (viewedContentSchema) {
    super(parse`/posts/${'id'}`, viewedContentSchema)
  }

  async perform (_model, data) {
    data.type = 'ViewedContent'
    data.payload = { id: data.meta.req.urlParams.id }
    const { model } = await super.perform(_model, data)

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

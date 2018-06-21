// imports
import { parse, Actor, Schema } from 'hive-io'

import PostIdSchema from '../../schemas/json/PostId.json'
import ViewedContentSchema from '../../schemas/json/events/ViewedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class ViewContentActor
 */
class ViewContentActor extends Actor {
  constructor (viewedContentSchema) {
    super(parse`/posts/${'id'}`, viewedContentSchema)
  }

  async perform (modelInst, data) {
    data.type = 'ViewedContent'
    data.payload = { id: data.meta.urlParams.id }
    const { model } = await super.perform(modelInst, data)

    return { id: data.meta.urlParams.id, model }
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

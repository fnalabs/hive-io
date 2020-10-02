// imports
import { MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import EnabledContentSchema from '../../schemas/json/events/EnabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/Content': ContentSchema,
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class EnableContentActor
 */
class EnableContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (modelInst.enabled === true) throw new Error('#EnableContent: content already enabled')

    const { command, event, model } = await super.perform(modelInst, action)

    model.enabled = true

    return { meta: { key: model.id }, command, event, model }
  }
}

/*
 * Proxy<EnableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EnableContentActor, {
  construct: async function (EnableContentActor) {
    const postSchema = await new Schema(PostSchema, REFS)
    const enabledContentSchema = await new Schema(EnabledContentSchema, REFS)

    return new EnableContentActor(postSchema, enabledContentSchema)
  }
})

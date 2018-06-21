// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import EnabledContentSchema from '../../schemas/json/events/EnabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/Content': ContentSchema,
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class EnableContentActor
 */
class EnableContentActor extends MessageActor {
  constructor (postSchema, enabledContentSchema) {
    super(parse`/posts/${'id'}/content`, postSchema, enabledContentSchema)
  }

  async perform (modelInst, data) {
    if (modelInst.enabled === true) throw new Error('#EnableContent: content already enabled')

    const { command, event, model } = await super.perform(modelInst, data)

    model.enabled = true

    return { id: model.id, command, event, model }
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

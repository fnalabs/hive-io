// imports
import { MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import DisabledContentSchema from '../../schemas/json/events/DisabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/Content': ContentSchema,
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class DisableContentActor
 */
class DisableContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (modelInst.enabled === false) throw new Error('#DisableContent: content already disabled')

    const { command, event, model } = await super.perform(modelInst, action)

    model.enabled = false

    return { meta: { key: model.id }, command, event, model }
  }
}

/*
 * Proxy<DisableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(DisableContentActor, {
  construct: async function (DisableContentActor) {
    const postSchema = await new Schema(PostSchema, REFS)
    const disabledContentSchema = await new Schema(DisabledContentSchema, REFS)

    return new DisableContentActor(postSchema, disabledContentSchema)
  }
})

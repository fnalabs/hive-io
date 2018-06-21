// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import DisabledContentSchema from '../../schemas/json/events/DisabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/Content': ContentSchema,
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class DisableContentActor
 */
class DisableContentActor extends MessageActor {
  constructor (postSchema, disabledContentSchema) {
    super(parse`/posts/${'id'}/content`, postSchema, disabledContentSchema)
  }

  async perform (modelInst, data) {
    if (modelInst.enabled === false) throw new Error('#DisableContent: content already disabled')

    const { command, event, model } = await super.perform(modelInst, data)

    model.enabled = false

    return { id: model.id, command, event, model }
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

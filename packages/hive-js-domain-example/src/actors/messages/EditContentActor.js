// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import EditContentSchema from '../../schemas/json/commands/EditContent.json'
import EditedContentSchema from '../../schemas/json/events/EditedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/Content': ContentSchema,
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class EditContentActor
 */
class EditContentActor extends MessageActor {
  constructor (postSchema, editedContentSchema, editContentSchema) {
    super(parse`/posts/${'id'}/content`, postSchema, editedContentSchema, editContentSchema)
  }

  async perform (modelInst, data) {
    if (typeof modelInst === 'undefined') throw new Error(`#${data.type}: ${data.payload.id} doesn't exist`)

    const { command, event, model } = await super.perform(modelInst, data)

    model.edited = true

    return { id: model.id, command, event, model }
  }
}

/*
 * Proxy<EditContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EditContentActor, {
  construct: async function (EditContentActor) {
    const postSchema = await new Schema(PostSchema, REFS)
    const editedContentSchema = await new Schema(EditedContentSchema, REFS)
    const editContentSchema = await new Schema(EditContentSchema, REFS)

    return new EditContentActor(postSchema, editedContentSchema, editContentSchema)
  }
})

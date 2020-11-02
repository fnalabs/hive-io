// imports
import { MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import EditContentSchema from '../../schemas/json/commands/EditContent.json'
import EditedContentSchema from '../../schemas/json/events/EditedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/Content': ContentSchema,
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class EditContentActor
 */
class EditContentActor extends MessageActor {
  async perform (modelInst, action) {
    if (typeof modelInst === 'undefined') throw new Error(`#${action.type}: ${action.payload.id} doesn't exist`)

    const { command, event, model } = await super.perform(modelInst, action)

    model.edited = true

    return { meta: { key: model.id }, command, event, model }
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

    return new EditContentActor(editedContentSchema, editContentSchema, postSchema)
  }
})

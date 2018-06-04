// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import CreateContentSchema from '../../schemas/json/commands/CreateContent.json'
import CreatedContentSchema from '../../schemas/json/events/CreatedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/Content': ContentSchema,
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class CreateContentActor
 */
class CreateContentActor extends MessageActor {
  constructor (postSchema, createdContentSchema, createContentSchema) {
    super(parse`/posts/${'postId'}/content`, postSchema, createdContentSchema, createContentSchema)
  }

  async perform (modelInst, data) {
    if (typeof modelInst !== 'undefined') throw new Error(`#${data.type}: ${modelInst.postId.id} already exists`)

    const { command, event, model } = await super.perform(modelInst, data)

    model.content.enabled = true
    model.content.edited = false

    return { id: model.postId.id, command, event, model }
  }
}

/*
 * Proxy<CreateContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(CreateContentActor, {
  construct: async function (CreateContentActor) {
    const postSchema = await new Schema(PostSchema, REFS)
    const createdContentSchema = await new Schema(CreatedContentSchema, REFS)
    const createContentSchema = await new Schema(CreateContentSchema, REFS)

    return new CreateContentActor(postSchema, createdContentSchema, createContentSchema)
  }
})

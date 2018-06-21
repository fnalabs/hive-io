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
    super(parse`/posts/${'id'}/content`, postSchema, createdContentSchema, createContentSchema)
  }

  async perform (modelInst, data) {
    if (typeof modelInst !== 'undefined') throw new Error(`#${data.type}: ${modelInst.id} already exists`)

    const { command, event, model } = await super.perform(modelInst, data)

    model.enabled = true
    model.edited = false

    return { id: model.id, command, event, model }
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

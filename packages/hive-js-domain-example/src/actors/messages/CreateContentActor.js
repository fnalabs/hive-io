// imports
import { MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../schemas/json/Content.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

import CreateContentSchema from '../../schemas/json/commands/CreateContent.json'
import CreatedContentSchema from '../../schemas/json/events/CreatedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/Content': ContentSchema,
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class CreateContentActor
 */
class CreateContentActor extends MessageActor {
  async perform (modelInst, data) {
    if (typeof modelInst !== 'undefined') throw new Error(`#${data.type}: ${modelInst.id} already exists`)

    const { command, event, model } = await super.perform(modelInst, data)

    model.enabled = true
    model.edited = false

    return { meta: { key: model.id }, command, event, model }
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

    return new CreateContentActor(undefined, postSchema, createdContentSchema, createContentSchema)
  }
})

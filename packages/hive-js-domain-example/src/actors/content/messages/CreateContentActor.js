// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../../schemas/json/content/Content.json'
import ContentIdSchema from '../../../schemas/json/content/ContentId.json'

import CreateContentSchema from '../../../schemas/json/content/commands/CreateContent.json'
import CreatedContentSchema from '../../../schemas/json/content/events/CreatedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class CreateContentActor
 */
class CreateContentActor extends MessageActor {
  constructor (contentSchema, createdContentSchema, createContentSchema) {
    super(parse`/content`, contentSchema, createdContentSchema, createContentSchema)
  }

  async perform (payload, modelInstance, repository) {
    if (typeof modelInstance !== 'undefined') throw new Error(`#${payload.meta.model}: ${modelInstance.id.id} already exists`)

    payload.data.id = { id: payload.meta.id }

    const { command, event, model } = await super.perform(payload, modelInstance, repository)

    model.enabled = true
    model.edited = false

    return { id: payload.data.id.id, command, event, model }
  }
}

/*
 * Proxy<CreateContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(CreateContentActor, {
  construct: async function (CreateContentActor) {
    const contentSchema = await new Schema(ContentSchema, REFS)
    const createdContentSchema = await new Schema(CreatedContentSchema, REFS)
    const createContentSchema = await new Schema(CreateContentSchema, REFS)

    return new CreateContentActor(contentSchema, createdContentSchema, createContentSchema)
  }
})

// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../../schemas/json/content/Content.json'
import ContentIdSchema from '../../../schemas/json/content/ContentId.json'

import EditContentSchema from '../../../schemas/json/content/commands/EditContent.json'
import EditedContentSchema from '../../../schemas/json/content/events/EditedContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class EditContentActor
 */
class EditContentActor extends MessageActor {
  constructor (contentSchema, editedContentSchema, editContentSchema) {
    super(parse`/content/${'contentId'}`, contentSchema, editedContentSchema, editContentSchema)
  }

  async perform (payload, modelInstance, repository) {
    const { command, event, model } = await super.perform(payload, modelInstance, repository)
    model.edited = true
    return { command, event, model }
  }
}

/*
 * Proxy<EditContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EditContentActor, {
  construct: async function (EditContentActor) {
    const contentSchema = await new Schema(ContentSchema, REFS)
    const editedContentSchema = await new Schema(EditedContentSchema)
    const editContentSchema = await new Schema(EditContentSchema)

    return new EditContentActor(contentSchema, editedContentSchema, editContentSchema)
  }
})

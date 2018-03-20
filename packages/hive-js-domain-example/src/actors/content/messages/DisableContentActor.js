// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../../schemas/json/content/Content.json'
import PostIdSchema from '../../../schemas/json/post/PostId.json'

import DisableContentSchema from '../../../schemas/json/content/commands/DisableContent.json'
import DisabledContentSchema from '../../../schemas/json/content/events/DisabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class DisableContentActor
 */
class DisableContentActor extends MessageActor {
  constructor (contentSchema, disabledContentSchema, disableContentSchema) {
    super(parse`/content/${'postId'}`, contentSchema, disabledContentSchema, disableContentSchema)
  }

  async perform (payload, modelInstance, repository) {
    if (modelInstance.enabled === false) throw new Error(`#${payload.meta.model}: content already disabled`)

    const { command, event, model } = await super.perform(payload, modelInstance, repository)
    model.enabled = false
    return { id: payload.meta.id, command, event, model }
  }
}

/*
 * Proxy<DisableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(DisableContentActor, {
  construct: async function (DisableContentActor) {
    const contentSchema = await new Schema(ContentSchema, REFS)
    const disabledContentSchema = await new Schema(DisabledContentSchema)
    const disableContentSchema = await new Schema(DisableContentSchema)

    return new DisableContentActor(contentSchema, disabledContentSchema, disableContentSchema)
  }
})

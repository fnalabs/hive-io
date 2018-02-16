// imports
import { parse, MessageActor, Schema } from 'hive-io'

import ContentSchema from '../../../schemas/json/content/Content.json'
import ContentIdSchema from '../../../schemas/json/content/ContentId.json'

import EnableContentSchema from '../../../schemas/json/content/commands/EnableContent.json'
import EnabledContentSchema from '../../../schemas/json/content/events/EnabledContent.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class EnableContentActor
 */
class EnableContentActor extends MessageActor {
  constructor (contentSchema, enabledContentSchema, enableContentSchema) {
    super(parse`/content/${'contentId'}`, contentSchema, enabledContentSchema, enableContentSchema)
  }

  async perform (payload, modelInstance, repository) {
    if (modelInstance.enabled === true) throw new Error(`#${payload.meta.model}: content already enabled`)

    const { command, event, model } = await super.perform(payload, modelInstance, repository)
    model.enabled = true
    return { command, event, model }
  }
}

/*
 * Proxy<EnableContentActor> for async initialization of the Schemas w/ refs
 */
export default new Proxy(EnableContentActor, {
  construct: async function (EnableContentActor) {
    const contentSchema = await new Schema(ContentSchema, REFS)
    const enabledContentSchema = await new Schema(EnabledContentSchema)
    const enableContentSchema = await new Schema(EnableContentSchema)

    return new EnableContentActor(contentSchema, enabledContentSchema, enableContentSchema)
  }
})

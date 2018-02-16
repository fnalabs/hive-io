// imports
import { parse, Actor, Schema } from 'hive-io'

import {
  CreateContentActor,
  DisableContentActor,
  EditContentActor,
  EnableContentActor
} from './messages'

import ContentSchema from '../../schemas/json/content/Content.json'
import ContentIdSchema from '../../schemas/json/content/ContentId.json'

// private properties
const ACTORS = Symbol('MessageActors')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class ContentActor
 */
class ContentActor extends Actor {
  constructor (contentSchema, actors) {
    super(parse`/content/${'contentId'}`, contentSchema)

    Object.defineProperty(this, ACTORS, { value: actors })
  }

  async perform (payload, modelInstance, repository) {
    switch (payload.meta.model) {
      case 'CreateContent':
      case 'CreatedContent':
        return this[ACTORS].createContentActor.perform(payload, modelInstance, repository)

      case 'DisableContent':
      case 'DisabledContent':
        return this[ACTORS].disableContentActor.perform(payload, modelInstance, repository)

      case 'EditContent':
      case 'EditedContent':
        return this[ACTORS].editContentActor.perform(payload, modelInstance, repository)

      case 'EnableContent':
      case 'EnabledContent':
        return this[ACTORS].enableContentActor.perform(payload, modelInstance, repository)

      default:
        throw new Error('Command|Event not recognized')
    }
  }
}

/*
 * Proxy<ContentActor> for async initialization of the Schema w/ refs and MessageActors
 */
export default new Proxy(ContentActor, {
  construct: async function (ContentActor) {
    const contentSchema = await new Schema(ContentSchema, REFS)

    const createContentActor = await new CreateContentActor()
    const disableContentActor = await new DisableContentActor()
    const editContentActor = await new EditContentActor()
    const enableContentActor = await new EnableContentActor()

    return new ContentActor(contentSchema, {
      createContentActor,
      disableContentActor,
      editContentActor,
      enableContentActor
    })
  }
})

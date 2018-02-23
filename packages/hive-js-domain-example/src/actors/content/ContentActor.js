// imports
import uuidV4 from 'uuid/v4'
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
        payload.meta.id = { id: uuidV4() }
      case 'CreatedContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].createContentActor.perform(payload, modelInstance, repository)

      case 'DisableContent':
        payload.meta.id = { id: payload.meta.urlParams.contentId }
      case 'DisabledContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].disableContentActor.perform(payload, modelInstance, repository)

      case 'EditContent':
        payload.meta.id = { id: payload.meta.urlParams.contentId }
      case 'EditedContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].editContentActor.perform(payload, modelInstance, repository)

      case 'EnableContent':
        payload.meta.id = { id: payload.meta.urlParams.contentId }
      case 'EnabledContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].enableContentActor.perform(payload, modelInstance, repository)

      default:
        throw new Error('Command|Event not recognized')
    }
  }

  async replay (payload, repository) {
    if (typeof payload.meta.urlParams.contentId === 'undefined') return
    const aggregate = await repository.get(payload.meta.urlParams.contentId)
    return super.replay(aggregate, repository)
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

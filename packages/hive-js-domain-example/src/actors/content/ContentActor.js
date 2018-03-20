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
import PostIdSchema from '../../schemas/json/post/PostId.json'

// private properties
const ACTORS = Symbol('MessageActors')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class ContentActor
 */
class ContentActor extends Actor {
  constructor (contentSchema, actors) {
    super(parse`/content/${'postId'}`, contentSchema)
    Object.defineProperty(this, ACTORS, { value: actors })
  }

  async perform (payload, modelInstance, repository) {
    switch (payload.meta.model) {
      case 'CreateContent':
        payload.meta.id = uuidV4()
        payload.meta.version = 1
      case 'CreatedContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].createContentActor.perform(payload, modelInstance, repository)

      case 'DisableContent':
        payload.meta.id = payload.meta.urlParams.postId
        payload.meta.version++
      case 'DisabledContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].disableContentActor.perform(payload, modelInstance, repository)

      case 'EditContent':
        payload.meta.id = payload.meta.urlParams.postId
        payload.meta.version++
      case 'EditedContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].editContentActor.perform(payload, modelInstance, repository)

      case 'EnableContent':
        payload.meta.id = payload.meta.urlParams.postId
        payload.meta.version++
      case 'EnabledContent': // eslint-disable-line no-fallthrough
        return this[ACTORS].enableContentActor.perform(payload, modelInstance, repository)

      default:
        throw new Error('Command|Event not recognized')
    }
  }

  async replay (payload, repository) {
    const isUrlParam = payload.meta.urlParams && payload.meta.urlParams.postId
    if (payload.meta.id || isUrlParam) {
      const id = isUrlParam ? payload.meta.urlParams.postId : payload.meta.id
      const aggregate = await repository.get(id)
      return super.replay(aggregate, repository)
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

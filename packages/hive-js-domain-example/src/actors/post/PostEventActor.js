// imports
import { parse, Actor, Schema } from 'hive-io'

import {
  CreateContentActor,
  DisableContentActor,
  EditContentActor,
  EnableContentActor
} from '../content/messages'
import ViewActor from '../ViewActor'

import PostSchema from '../../schemas/json/Post.json'
import ContentIdSchema from '../../schemas/json/content/ContentId.json'

// private properties
const ACTORS = Symbol('MessageActors')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class PostEventActor
 */
class PostEventActor extends Actor {
  constructor (postSchema, actors) {
    super(parse`/post/${'postId'}`, postSchema)

    Object.defineProperty(this, ACTORS, { value: actors })
  }

  // TODO: implement ephemeral data calls here
  async perform (payload, modelInstance, repository) {
    switch (payload.meta.model) {
      case 'CreatedContent': {
        const { command, event, model } =
          await this[ACTORS].createContentActor.perform(payload, modelInstance, repository)

        model.viewed = 0
        return { command, event, model }
      }

      case 'DisabledContent':
        return this[ACTORS].disableContentActor.perform(payload, modelInstance, repository)

      case 'EditedContent':
        return this[ACTORS].editContentActor.perform(payload, modelInstance, repository)

      case 'EnabledContent':
        return this[ACTORS].enableContentActor.perform(payload, modelInstance, repository)

      case 'View': {
        const { model } = await this[ACTORS].viewActor.perform(payload)
        ++modelInstance.viewed
        return { command: null, event: model, model: modelInstance }
      }

      default:
        throw new Error('Command|Event not recognized')
    }
  }
}

/*
 * Proxy<PostEventActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostEventActor, {
  construct: async function (PostEventActor) {
    // TODO: add connection to ephemeral storage (MongoDB) here

    const postSchema = await new Schema(PostSchema, REFS)

    const createContentActor = await new CreateContentActor()
    const disableContentActor = await new DisableContentActor()
    const editContentActor = await new EditContentActor()
    const enableContentActor = await new EnableContentActor()
    const viewActor = await new ViewActor()

    return new PostEventActor(postSchema, {
      createContentActor,
      disableContentActor,
      editContentActor,
      enableContentActor,
      viewActor
    })
  }
})

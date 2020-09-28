// imports
import { v4 as uuidV4 } from 'uuid'
import { Actor, Model, Schema } from 'hive-io'

import {
  CreateContentActor,
  DisableContentActor,
  EditContentActor,
  EnableContentActor
} from '../messages'
import LogSystem from '../../systems/LogSystem'

import ContentSchema from '../../schemas/json/Content.json'
import LogSchema from '../../schemas/json/Log.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import PostSchema from '../../schemas/json/Post.json'

// private properties
const ACTORS = Symbol('MessageActors')
const LOG_SCHEMA = Symbol('Log schema')
const LOG_SYSTEM = Symbol('Log System')

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/Content': ContentSchema,
  'https://hiveframework.io/api/v2/models/PostId': PostIdSchema
}

/*
 * class PostCommandActor
 */
class PostCommandActor extends Actor {
  constructor (postSchema, logSchema, logSystem, actors, repository) {
    super(postSchema, repository)
    Object.defineProperties(this, {
      [ACTORS]: { value: actors },
      [LOG_SCHEMA]: { value: logSchema },
      [LOG_SYSTEM]: { value: logSystem }
    })
  }

  async perform (model, action) {
    if (action.type === 'Post') return super.perform(model, action)

    let results
    switch (true) {
      case action.payload?.text && action.meta?.request?.method === 'PATCH':
        action.type = 'EditContent'
        action.payload.id = action.meta.request.params.id
      case action.type === 'EditedContent': // eslint-disable-line no-fallthrough
        results = await this[ACTORS].editContentActor.perform(model, action)
        break

      case action.meta?.request?.method === 'PATCH':
        action.payload = { id: action.meta.request.params.id }
      case action.type === 'EnabledContent': // eslint-disable-line no-fallthrough
        results = await this[ACTORS].enableContentActor.perform(model, action)
        break

      case action.meta?.request?.method === 'POST':
        action.type = 'CreateContent'
        action.payload.id = uuidV4()
      case action.type === 'CreatedContent': // eslint-disable-line no-fallthrough
        results = await this[ACTORS].createContentActor.perform(model, action)
        break

      case action.meta?.request?.method === 'DELETE':
        action.type = 'CreateContent'
        action.payload = { id: action.meta.request.params.id }
      case action.type === 'DisabledContent': // eslint-disable-line no-fallthrough
        results = await this[ACTORS].disableContentActor.perform(model, action)
        break

      default:
        throw new Error('Command|Event not recognized')
    }

    if (action.meta?.request) {
      const log = await new Model({ type: 'Log', payload: { ...action.meta.request, actor: 'PostCommandActor' } }, this[LOG_SCHEMA], { immutable: true })
      this[LOG_SYSTEM].emit(log)
    }

    return results
  }
}

/*
 * Proxy<PostCommandActor> for async initialization of the Schema w/ refs and MessageActors
 */
export default new Proxy(PostCommandActor, {
  construct: async function (PostCommandActor, argsList) {
    const postSchema = await new Schema(PostSchema, REFS)
    const logSchema = await new Schema(LogSchema)

    const createContentActor = await new CreateContentActor()
    const disableContentActor = await new DisableContentActor()
    const editContentActor = await new EditContentActor()
    const enableContentActor = await new EnableContentActor()

    const logSystem = await new LogSystem()

    return new PostCommandActor(postSchema, logSchema, logSystem, {
      createContentActor,
      disableContentActor,
      editContentActor,
      enableContentActor
    }, argsList[0])
  }
})

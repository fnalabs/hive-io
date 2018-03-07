// imports
import CONSTANTS from '../../constants'

import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'
import ContentIdSchema from '../../schemas/json/content/ContentId.json'

// private properties
const REPOSITORY = Symbol('Consumer ephemeral DB')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class PostEventActor
 */
class PostEventActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)

    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload, modelInstance, repository) {
    const id = payload.meta.id || payload.data.id.id
    const conditions = { 'id.id': id }

    let update
    switch (payload.meta.model) {
      case 'CreatedContent':
        update = payload.data
        break

      case 'DisabledContent':
        update = { $set: { enabled: false } }
        break

      case 'EditedContent':
        update = { $set: { text: payload.data.text } }
        break

      case 'EnabledContent':
        update = { $set: { enabled: true } }
        break

      case 'View':
        update = { $inc: { views: 1 } }
        break

      default:
        throw new Error('Command|Event not recognized')
    }

    await this[REPOSITORY].findOneAndUpdate(conditions, update, CONSTANTS.UPDATE_OPTIONS).exec()
  }
}

/*
 * Proxy<PostEventActor> for async initialization of the Schema w/ refs and Mongo connection
 */
export default new Proxy(PostEventActor, {
  construct: async function (PostEventActor, argsList) {
    const model = argsList[0]
    const postSchema = await new Schema(PostSchema, REFS)

    return new PostEventActor(postSchema, model)
  }
})

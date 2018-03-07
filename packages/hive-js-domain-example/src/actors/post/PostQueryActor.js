// imports
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
 * class PostQueryActor
 */
class PostQueryActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload) {
    if (payload.meta.method !== 'GET') throw new TypeError('Post values can only be queried from this endpoint')

    return typeof payload.meta.urlParams.postId === 'string'
      ? this[REPOSITORY].findOne({ 'id.id': payload.meta.urlParams.postId }).exec()
      : this[REPOSITORY].find().exec()
  }
}

/*
 * Proxy<PostQueryActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostQueryActor, {
  construct: async function (PostQueryActor, argsList) {
    const model = argsList[0]

    const postSchema = await new Schema(PostSchema, REFS)
    return new PostQueryActor(postSchema, model)
  }
})

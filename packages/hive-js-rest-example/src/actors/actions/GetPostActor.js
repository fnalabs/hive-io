// imports
import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'
import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const REPOSITORY = Symbol('Consumer DB')

/*
 * class GetPostActor
 */
class GetPostActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload) {
    const id = payload.meta.urlParams.postId
    const conditions = { id }
    const update = { $inc: { views: 1 } }

    const model = typeof id === 'string'
      ? await this[REPOSITORY].findOneAndUpdate(conditions, update).exec()
      : await this[REPOSITORY].find().exec()

    return { model }
  }
}

/*
 * Proxy<GetPostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(GetPostActor, {
  construct: async function (GetPostActor, argsList) {
    const repository = argsList[0]
    const model = repository.model('Post', new MongoSchema())
    const postSchema = await new Schema(PostSchema)
    return new GetPostActor(postSchema, model)
  }
})

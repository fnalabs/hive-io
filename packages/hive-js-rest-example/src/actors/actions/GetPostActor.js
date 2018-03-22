// imports
import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

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
    const _id = payload.meta.urlParams.postId
    const conditions = { _id }
    const update = { $inc: { views: 1 } }

    const model = typeof _id === 'string'
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
    const postSchema = await new Schema(PostSchema)
    return new GetPostActor(postSchema, repository)
  }
})

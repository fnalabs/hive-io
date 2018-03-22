// imports
import CONSTANTS from '../../constants'

import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

// private properties
const REPOSITORY = Symbol('Consumer DB')

/*
 * class DeletePostActor
 */
class DeletePostActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload) {
    // upload to mongo
    const conditions = { _id: payload.meta.urlParams.postId }
    const update = { $set: { enabled: false } }
    const model =
      await this[REPOSITORY].findOneAndUpdate(conditions, update, CONSTANTS.UPDATE_OPTIONS).exec()

    return { model }
  }
}

/*
 * Proxy<DeletePostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(DeletePostActor, {
  construct: async function (DeletePostActor, argsList) {
    const repository = argsList[0]
    const postSchema = await new Schema(PostSchema)
    return new DeletePostActor(postSchema, repository)
  }
})

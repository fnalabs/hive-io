// imports
import CONSTANTS from '../../constants'

import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

/*
 * class DeletePostActor
 */
class DeletePostActor extends Actor {
  constructor (postSchema, repository) {
    super(parse`/post/${'postId'}`, postSchema, repository)
  }

  async perform (model, data) {
    // upload to mongo
    const conditions = { _id: data.meta.urlParams.postId }
    const update = { $set: { enabled: false } }

    model =
      await this.repository.findOneAndUpdate(conditions, update, CONSTANTS.UPDATE_OPTIONS).exec()

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

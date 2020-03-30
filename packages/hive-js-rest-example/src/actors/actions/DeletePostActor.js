// imports
import { Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

import { UPDATE_OPTIONS } from '../../config'

/*
 * class DeletePostActor
 */
class DeletePostActor extends Actor {
  async perform (model, data) {
    // upload to mongo
    const conditions = { _id: data.meta.req.urlParams.postId }
    const update = { $set: { enabled: false } }

    model = await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()

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

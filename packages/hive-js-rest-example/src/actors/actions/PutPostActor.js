// imports
import { UPDATE_OPTIONS } from '../../config'

import { Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

/*
 * class PutPostActor
 */
class PutPostActor extends Actor {
  async perform (model, data) {
    // validate
    await super.perform(model, data)

    // prepare upload params
    const conditions = { _id: data.meta.req.urlParams.postId }
    const update = { $set: { text: data.payload.text, edited: true } }

    // upload to mongo
    model = await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()

    return { model }
  }
}

/*
 * Proxy<PutPostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PutPostActor, {
  construct: async function (PutPostActor, argsList) {
    const repository = argsList[0]
    const postSchema = await new Schema(PostSchema)
    return new PutPostActor(postSchema, repository)
  }
})

// imports
import uuidV4 from 'uuid/v4'
import { Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

/*
 * class PostPostActor
 */
class PostPostActor extends Actor {
  async perform (model, data) {
    const Model = this.repository

    // validate
    await super.perform(model, data)

    // upload to mongo
    const post = { _id: uuidV4(), text: data.payload.text }
    model = await new Model(post).save()

    return { model }
  }
}

/*
 * Proxy<PostPostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostPostActor, {
  construct: async function (PostPostActor, argsList) {
    const repository = argsList[0]
    const postSchema = await new Schema(PostSchema)
    return new PostPostActor(postSchema, repository)
  }
})

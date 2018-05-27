// imports
import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

/*
 * class GetPostActor
 */
class GetPostActor extends Actor {
  constructor (postSchema, repository) {
    super(parse`/post/${'postId'}`, postSchema, repository)
  }

  async perform (model, data) {
    const _id = data.meta.urlParams.postId
    const conditions = { _id }
    const update = { $inc: { views: 1 } }

    model = typeof _id === 'string'
      ? await this.repository.findOneAndUpdate(conditions, update).exec()
      : await this.repository.find().exec()

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

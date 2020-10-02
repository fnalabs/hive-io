// imports
import { Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

/*
 * class GetPostActor
 */
class GetPostActor extends Actor {
  async perform (model, action) {
    const _id = action.meta.request.params.postId
    const conditions = { _id }
    const update = { $inc: { viewed: 1 } }

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

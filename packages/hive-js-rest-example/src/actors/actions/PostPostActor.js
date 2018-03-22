// imports
import uuidV4 from 'uuid/v4'
import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'

// private properties
const REPOSITORY = Symbol('Consumer DB')

/*
 * class PostPostActor
 */
class PostPostActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload) {
    // validate
    await super.perform(payload)

    // upload to mongo
    const post = { _id: uuidV4(), text: payload.data.text }
    const model = await new this[REPOSITORY](post).save()

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

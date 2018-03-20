// imports
import CONSTANTS from '../../constants'

import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../../schemas/json/Post.json'
import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const REPOSITORY = Symbol('Consumer DB')

/*
 * class PutPostActor
 */
class PutPostActor extends Actor {
  constructor (postSchema, model) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, REPOSITORY, { value: model })
  }

  async perform (payload) {
    // validate
    await super.perform(payload)

    // prepare upload params
    const conditions = { id: payload.data.id }
    const update = { $set: { text: payload.data.text, edited: true } }

    // upload to mongo
    const model =
      await this[REPOSITORY].findOneAndUpdate(conditions, update, CONSTANTS.UPDATE_OPTIONS).exec()

    return { model }
  }
}

/*
 * Proxy<PutPostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PutPostActor, {
  construct: async function (PutPostActor, argsList) {
    const repository = argsList[0]
    const model = repository.model('Post', new MongoSchema())
    const postSchema = await new Schema(PostSchema)
    return new PutPostActor(postSchema, model)
  }
})

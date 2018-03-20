// imports
import mongoConnect from '../../util/mongoConnect'
import { parse, Actor, Schema } from 'hive-io'

import PostEventActor from './PostEventActor'
import PostQueryActor from './PostQueryActor'

import PostSchema from '../../schemas/json/post/Post.json'
import PostIdSchema from '../../schemas/json/post/PostId.json'

import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const ACTORS = Symbol('MessageActors hash')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class PostActor
 */
class PostActor extends Actor {
  constructor (postSchema, actors) {
    super(parse`/post/${'postId'}`, postSchema)

    Object.defineProperty(this, ACTORS, { value: actors })
  }

  async perform (payload) {
    return typeof payload.meta.method === 'string'
      ? this[ACTORS].postQueryActor.perform(payload)
      : this[ACTORS].postEventActor.perform(payload)
  }
}

/*
 * Proxy<PostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostActor, {
  construct: async function (PostActor) {
    const repository = await mongoConnect()
    const model = repository.model('Post', new MongoSchema())

    const postEventActor = await new PostEventActor(model)
    const postQueryActor = await new PostQueryActor(model)

    const postSchema = await new Schema(PostSchema, REFS)
    return new PostActor(postSchema, { postEventActor, postQueryActor })
  }
})

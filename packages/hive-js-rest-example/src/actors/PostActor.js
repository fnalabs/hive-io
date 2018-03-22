// imports
import mongoConnect from '../util/mongoConnect'

import { parse, Actor, Schema } from 'hive-io'

import {
  DeletePostActor,
  GetPostActor,
  PostPostActor,
  PutPostActor
} from './actions'

import PostSchema from '../schemas/json/Post.json'
import MongoSchema from '../schemas/mongoose/Post'

// constants
const urlRegexp = new RegExp('^/post')

// private properties
const ACTORS = Symbol('Actors')

/*
 * class PostActor
 */
class PostActor extends Actor {
  constructor (postSchema, actors) {
    super(parse`/post/${'postId'}`, postSchema)
    Object.defineProperty(this, ACTORS, { value: actors })
  }

  async perform (payload) {
    if (!urlRegexp.test(payload.meta.url.pathname)) throw new Error(`${payload.meta.url.pathname} not supported`)

    switch (payload.meta.method) {
      case 'GET':
        return this[ACTORS].getPostActor.perform(payload)

      case 'PUT':
        return this[ACTORS].putPostActor.perform(payload)

      case 'POST':
        return this[ACTORS].postPostActor.perform(payload)

      case 'DELETE':
        return this[ACTORS].deletePostActor.perform(payload)

      default:
        throw new Error('HTTP verb not supported')
    }
  }
}

/*
 * Proxy<PostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostActor, {
  construct: async function (PostActor) {
    const repository = await mongoConnect()
    const postSchema = await new Schema(PostSchema)
    const PostModel = repository.model('Post', new MongoSchema())

    const deletePostActor = await new DeletePostActor(PostModel)
    const getPostActor = await new GetPostActor(PostModel)
    const postPostActor = await new PostPostActor(PostModel)
    const putPostActor = await new PutPostActor(PostModel)

    return new PostActor(postSchema, {
      deletePostActor,
      getPostActor,
      postPostActor,
      putPostActor
    })
  }
})

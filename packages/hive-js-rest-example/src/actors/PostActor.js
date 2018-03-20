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

    const deletePostActor = await new DeletePostActor(repository)
    const getPostActor = await new GetPostActor(repository)
    const postPostActor = await new PostPostActor(repository)
    const putPostActor = await new PutPostActor(repository)

    return new PostActor(postSchema, {
      deletePostActor,
      getPostActor,
      postPostActor,
      putPostActor
    })
  }
})

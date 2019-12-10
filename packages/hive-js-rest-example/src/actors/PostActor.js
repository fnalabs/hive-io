// imports
import { parse, Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../util/mongoConnect'
import {
  DeletePostActor,
  GetPostActor,
  PostPostActor,
  PutPostActor
} from './actions'
import LogSystem from '../systems/LogSystem'

import LogSchema from '../schemas/json/Log.json'
import MongoSchema from '../schemas/mongoose/Post'

// constants
const urlRegexp = new RegExp('^/posts')

// private properties
const ACTORS = Symbol('Actors')
const LOG_SCHEMA = Symbol('Log schema')
const LOG_SYSTEM = Symbol('Log system')

/*
 * class PostActor
 */
class PostActor extends Actor {
  constructor (logSchema, logSystem, actors) {
    super(parse`/posts/${'postId'}`)

    Object.defineProperties(this, {
      [ACTORS]: { value: actors },
      [LOG_SCHEMA]: { value: logSchema },
      [LOG_SYSTEM]: { value: logSystem }
    })
  }

  async perform (model, data) {
    if (!urlRegexp.test(data.meta.req.url)) throw new Error(`${data.meta.req.url} not supported`)

    let results
    data.type = 'Post'
    switch (data.meta.req.method) {
      case 'GET':
        results = await this[ACTORS].getPostActor.perform(model, data)
        break

      case 'PATCH':
        results = await this[ACTORS].putPostActor.perform(model, data)
        break

      case 'POST':
        results = await this[ACTORS].postPostActor.perform(model, data)
        break

      case 'DELETE':
        results = await this[ACTORS].deletePostActor.perform(model, data)
        break

      default:
        throw new Error('HTTP verb not supported')
    }

    const log = await new Model({ type: 'Log', payload: data.meta.req }, this[LOG_SCHEMA], { immutable: true })
    this[LOG_SYSTEM].emit(log)

    return results
  }
}

/*
 * Proxy<PostActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostActor, {
  construct: async function (PostActor) {
    const repository = await mongoConnect()

    const PostModel = repository.model('Post', new MongoSchema())

    const deletePostActor = await new DeletePostActor(PostModel, repository)
    const getPostActor = await new GetPostActor(PostModel, repository)
    const postPostActor = await new PostPostActor(PostModel, repository)
    const putPostActor = await new PutPostActor(PostModel, repository)

    const logSchema = await new Schema(LogSchema)
    const logSystem = await new LogSystem()

    return new PostActor(logSchema, logSystem, {
      deletePostActor,
      getPostActor,
      postPostActor,
      putPostActor
    })
  }
})

// imports
import { parse, Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'
import LogSystem from '../../systems/LogSystem'

import LogSchema from '../../schemas/json/Log.json'
import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const LOG_SCHEMA = Symbol('Log schema')
const LOG_SYSTEM = Symbol('Log System')

/*
 * class PostQueryActor
 */
class PostQueryActor extends Actor {
  constructor (logSchema, logSystem, repository) {
    super(parse`/posts/${'postId'}`, undefined, repository)
    Object.defineProperties(this, {
      [LOG_SCHEMA]: { value: logSchema },
      [LOG_SYSTEM]: { value: logSystem }
    })
  }

  async perform (modelInst, data) {
    if (data.meta.method !== 'GET') throw new TypeError('Post values can only be queried from this endpoint')

    const model = typeof data.meta.urlParams.postId === 'string'
      ? await this.repository.findOne({ _id: data.meta.urlParams.postId }).exec()
      : await this.repository.find().exec()

    const log = await new Model({ type: 'Log', payload: { ...data.meta, actor: 'PostQueryActor' } }, this[LOG_SCHEMA], { immutable: true })
    this[LOG_SYSTEM].emit(log)

    return { model }
  }
}

/*
 * Proxy<PostQueryActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostQueryActor, {
  construct: async function (PostQueryActor) {
    const repository = await mongoConnect()
    const model = repository.model('Post', new MongoSchema())

    const logSchema = await new Schema(LogSchema)
    const logSystem = await new LogSystem()

    return new PostQueryActor(logSchema, logSystem, model)
  }
})

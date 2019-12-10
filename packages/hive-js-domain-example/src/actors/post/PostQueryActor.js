// imports
import { parse, Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'
import LogSystem from '../../systems/LogSystem'

import PostId from '../../schemas/json/PostId.json'
import LogSchema from '../../schemas/json/Log.json'
import ViewSchema from '../../schemas/json/View.json'
import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const LOG_SCHEMA = Symbol('Log schema')
const LOG_SYSTEM = Symbol('Log System')
const VIEW_SCHEMA = Symbol('View schema')

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/PostId': PostId
}

/*
 * class PostQueryActor
 */
class PostQueryActor extends Actor {
  constructor (logSchema, logSystem, viewSchema, repository) {
    super(parse`/posts/${'id'}`, undefined, repository)
    Object.defineProperties(this, {
      [LOG_SCHEMA]: { value: logSchema },
      [LOG_SYSTEM]: { value: logSystem },
      [VIEW_SCHEMA]: { value: viewSchema }
    })
  }

  async perform (_model, data) {
    if (data.meta.req.method !== 'GET') throw new TypeError('Post values can only be queried from this endpoint')

    const model = data.meta.req.urlParams.id
      ? await this.repository.findOne({ _id: data.meta.req.urlParams.id }).exec()
      : await this.repository.find().exec()

    // emit 'view' to count
    if (data.meta.req.urlParams.id) {
      const view = await new Model({ type: 'View', payload: { id: data.meta.req.urlParams.id } }, this[VIEW_SCHEMA], { immutable: true })
      this[LOG_SYSTEM].emit(view)
    }

    // emit 'log' for metrics
    const log = await new Model({ type: 'Log', payload: { ...data.meta.req, actor: 'PostQueryActor' } }, this[LOG_SCHEMA], { immutable: true })
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
    const viewSchema = await new Schema(ViewSchema, REFS)

    return new PostQueryActor(logSchema, logSystem, viewSchema, model)
  }
})

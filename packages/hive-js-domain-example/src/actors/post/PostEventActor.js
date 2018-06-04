// imports
import CONSTANTS from '../../constants'

import { parse, Actor, Model, Schema } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'
import LogSystem from '../../systems/LogSystem'

import LogSchema from '../../schemas/json/Log.json'
import MongoSchema from '../../schemas/mongoose/Post'

// private properties
const LOG_SCHEMA = Symbol('Log schema')
const LOG_SYSTEM = Symbol('Log System')

/*
 * class PostEventActor
 */
class PostEventActor extends Actor {
  constructor (logSchema, logSystem, repository) {
    super(parse`/posts`, undefined, repository)
    Object.defineProperties(this, {
      [LOG_SCHEMA]: { value: logSchema },
      [LOG_SYSTEM]: { value: logSystem }
    })
  }

  async perform (model, data) {
    const id = data.payload.postId.id
    const conditions = { _id: id }

    let update
    switch (data.type) {
      case 'CreatedContent':
        update = { _id: data.payload.postId.id, text: data.payload.content.text }
        break

      case 'DisabledContent':
        update = { $set: { enabled: false } }
        break

      case 'EditedContent':
        update = { $set: { text: data.payload.content.text, edited: true } }
        break

      case 'EnabledContent':
        update = { $set: { enabled: true } }
        break

      case 'ViewedContent':
        update = { $inc: { viewed: 1 } }
        break

      default:
        throw new Error('Event not recognized')
    }

    await this.repository.findOneAndUpdate(conditions, update, CONSTANTS.UPDATE_OPTIONS).exec()

    const log = await new Model({ type: 'Log', payload: { ...data.meta, actor: 'PostEventActor' } }, this[LOG_SCHEMA], { immutable: true })
    this[LOG_SYSTEM].emit(log)
  }
}

/*
 * Proxy<PostEventActor> for async initialization of the Schema w/ refs and Mongo connection
 */
export default new Proxy(PostEventActor, {
  construct: async function (PostEventActor) {
    const repository = await mongoConnect()
    const model = repository.model('Post', new MongoSchema())

    const logSchema = await new Schema(LogSchema)
    const logSystem = await new LogSystem()

    return new PostEventActor(logSchema, logSystem, model)
  }
})

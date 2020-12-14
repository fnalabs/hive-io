// imports
import { UPDATE_OPTIONS } from '../../config'

import { Actor } from 'hive-io'

import mongoConnect from '../../util/mongoConnect'

import MongoSchema from '../../schemas/mongoose/Content'

import { trace } from '@opentelemetry/api'
const tracer = trace.getTracer('hive-consumer-js')

/*
 * class ContentEventActor
 */
class ContentEventActor extends Actor {
  async perform (_model, action) {
    const span = tracer.startSpan('ContentEventActor.perform')

    const id = action.payload.id
    const conditions = { _id: id }

    let update
    switch (action.type) {
      case 'CreatedContent':
        update = { _id: id, text: action.payload.text }
        break

      case 'DisabledContent':
        update = { $set: { enabled: false } }
        break

      case 'EditedContent':
        update = { $set: { text: action.payload.text, edited: true } }
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

    await this.repository.findOneAndUpdate(conditions, update, UPDATE_OPTIONS).exec()
    span.end()
  }
}

/*
 * Proxy<ContentEventActor> for async initialization of the Schema w/ refs and Mongo connection
 */
export default new Proxy(ContentEventActor, {
  construct: async function (ContentEventActor) {
    const repository = await mongoConnect()
    const model = repository.model('Content', new MongoSchema())

    return new ContentEventActor(undefined, model)
  }
})

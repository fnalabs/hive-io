// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../config'

import { trace, SpanKind, StatusCode } from '@opentelemetry/api'
import { Actor } from 'hive-io'

import mongoConnect from '../util/mongoConnect'
import {
  DeleteContentActor,
  GetContentActor,
  PostContentActor,
  PutContentActor
} from './actions'

import MongoSchema from '../schemas/mongoose/Content'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// private properties
const ACTORS = Symbol('Actors')

/*
 * class ContentActor
 */
class ContentActor extends Actor {
  constructor (actors) {
    super()

    Object.defineProperties(this, {
      [ACTORS]: { value: actors }
    })
  }

  async perform (model, action) {
    const span = tracer.startSpan('ContentActor.perform', { kind: SpanKind.SERVER })

    let results
    if (!action.type) action.type = 'Content'

    try {
      switch (action.meta.request.method) {
        case 'GET':
          results = await this[ACTORS].getContentActor.perform(model, action)
          break

        case 'PATCH':
          results = await this[ACTORS].putContentActor.perform(model, action)
          break

        case 'POST':
          results = await this[ACTORS].postContentActor.perform(model, action)
          break

        case 'DELETE':
          results = await this[ACTORS].deleteContentActor.perform(model, action)
          break

        default:
          throw new Error('HTTP verb not supported')
      }
      span.setStatus({ code: StatusCode.OK })
      span.end()

      return results
    } catch (error) {
      span.setStatus({ code: StatusCode.ERROR })
      span.end()

      throw error
    }
  }
}

/*
 * Proxy<ContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(ContentActor, {
  construct: async function (ContentActor) {
    const repository = await mongoConnect()

    const ContentModel = repository.model('Content', new MongoSchema())

    const deleteContentActor = await new DeleteContentActor(ContentModel, repository)
    const getContentActor = await new GetContentActor(ContentModel, repository)
    const postContentActor = await new PostContentActor(ContentModel, repository)
    const putContentActor = await new PutContentActor(ContentModel, repository)

    return new ContentActor({
      deleteContentActor,
      getContentActor,
      postContentActor,
      putContentActor
    })
  }
})

// imports
import { TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION } from '../../config'

import { trace, SpanKind, StatusCode } from '@opentelemetry/api'
import { Actor, Schema } from 'hive-io'
import { v4 as uuidV4 } from 'uuid'

import {
  CreateContentActor,
  DisableContentActor,
  EditContentActor,
  EnableContentActor
} from '../messages'

import ContentIdSchema from '../../schemas/json/ContentId.json'
import ContentSchema from '../../schemas/json/Content.json'
import TextSchema from '../../schemas/json/Text.json'

const tracer = trace.getTracer(TELEMETRY_LIB_NAME, TELEMETRY_LIB_VERSION)

// private properties
const ACTORS = Symbol('MessageActors')

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentIdSchema,
  'https://hiveframework.io/api/models/Text': TextSchema
}

/*
 * class ContentCommandActor
 */
class ContentCommandActor extends Actor {
  constructor (postSchema, actors, repository) {
    super(postSchema, repository)

    Object.defineProperties(this, {
      [ACTORS]: { value: actors }
    })
  }

  async perform (model, action) {
    if (action.type === 'Content') return super.perform(model, action)

    const span = tracer.startSpan('ContentCommandActor.perform', { kind: SpanKind.SERVER })

    try {
      let results
      switch (true) {
        case action.payload?.text && action.meta?.request?.method === 'PATCH':
          action.type = 'EditContent'
          action.payload.id = action.meta.request.params.id
        case action.type === 'EditedContent': // eslint-disable-line no-fallthrough
          results = await this[ACTORS].editContentActor.perform(model, action)
          break

        case action.meta?.request?.method === 'PATCH':
          action.type = 'EnableContent'
          action.payload = { id: action.meta.request.params.id }
        case action.type === 'EnabledContent': // eslint-disable-line no-fallthrough
          results = await this[ACTORS].enableContentActor.perform(model, action)
          break

        case action.meta?.request?.method === 'POST':
          action.type = 'CreateContent'
          action.payload.id = uuidV4()
        case action.type === 'CreatedContent': // eslint-disable-line no-fallthrough
          results = await this[ACTORS].createContentActor.perform(model, action)
          break

        case action.meta?.request?.method === 'DELETE':
          action.type = 'DisableContent'
          action.payload = { id: action.meta.request.params.id }
        case action.type === 'DisabledContent': // eslint-disable-line no-fallthrough
          results = await this[ACTORS].disableContentActor.perform(model, action)
          break

        default:
          throw new Error('Command|Event not recognized')
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
 * Proxy<ContentCommandActor> for async initialization of the Schema w/ refs and MessageActors
 */
export default new Proxy(ContentCommandActor, {
  construct: async function (ContentCommandActor, argsList) {
    const postSchema = await new Schema(ContentSchema, REFS)

    const createContentActor = await new CreateContentActor()
    const disableContentActor = await new DisableContentActor()
    const editContentActor = await new EditContentActor()
    const enableContentActor = await new EnableContentActor()

    return new ContentCommandActor(postSchema, {
      createContentActor,
      disableContentActor,
      editContentActor,
      enableContentActor
    }, argsList[0])
  }
})

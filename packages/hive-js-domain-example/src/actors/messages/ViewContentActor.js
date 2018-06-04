// imports
import { parse, Actor, Model, Schema } from 'hive-io'
import LogSystem from '../../systems/LogSystem'

import LogSchema from '../../schemas/json/Log.json'
import PostIdSchema from '../../schemas/json/PostId.json'
import ViewedContentSchema from '../../schemas/json/events/ViewedContent.json'

// private properties
const LOG_SCHEMA = Symbol('Log schema')

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class ViewContentActor
 */
class ViewContentActor extends Actor {
  constructor (viewedContentSchema, logSchema, logSystem) {
    super(parse`/posts/${'postId'}/viewed`, viewedContentSchema, logSystem)
    Object.defineProperty(this, LOG_SCHEMA, { value: logSchema })
  }

  async perform (modelInst, data) {
    data.type = 'ViewedContent'
    data.payload = { postId: { id: data.meta.urlParams.postId } }
    const { model } = await super.perform(modelInst, data)

    const log = await new Model({ type: 'Log', payload: { ...data.meta, actor: 'PostCommandActor' } }, this[LOG_SCHEMA], { immutable: true })
    this.repository.emit(log)

    return { id: data.meta.urlParams.postId, model }
  }
}

/*
 * Proxy<ViewContentActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(ViewContentActor, {
  construct: async function (ViewContentActor) {
    const viewedContentSchema = await new Schema(ViewedContentSchema, REFS)
    const logSchema = await new Schema(LogSchema)
    const logSystem = await new LogSystem()
    return new ViewContentActor(viewedContentSchema, logSchema, logSystem)
  }
})

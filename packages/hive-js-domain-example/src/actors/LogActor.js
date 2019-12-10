// imports
import { Actor, Schema } from 'hive-io'

import fluentConnect from '../util/fluentConnect'

import LogSchema from '../schemas/json/Log.json'

/*
 * class LogActor
 */
class LogActor extends Actor {
  async perform (model) {
    this.repository.emit(LogSchema.title, { message: JSON.stringify(model) })
  }
}

/*
 * Proxy<LogActor>
 */
export default new Proxy(LogActor, {
  construct: async function (LogActor) {
    const logger = fluentConnect()
    const logSchema = await new Schema(LogSchema)
    return new LogActor(logSchema, logger)
  }
})

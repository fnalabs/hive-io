// imports
import { System } from 'hive-io'

import LogSchema from '../schemas/json/Log.json'
import LogActor from '../actors/LogActor'

/*
 * class LogSystem
 */
class LogSystem extends System {
  constructor (logActor) {
    super()

    this.on(LogSchema, logActor)
  }
}

export default new Proxy(LogSystem, {
  construct: async function (LogSystem) {
    const logActor = await new LogActor()
    return new LogSystem(logActor)
  }
})

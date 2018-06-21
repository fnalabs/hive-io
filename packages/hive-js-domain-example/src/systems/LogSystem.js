// imports
import { System } from 'hive-io'

import LogSchema from '../schemas/json/Log.json'
import ViewSchema from '../schemas/json/View.json'

import LogActor from '../actors/LogActor'
import ViewActor from '../actors/ViewActor'

/*
 * class LogSystem
 */
class LogSystem extends System {
  constructor (logActor, viewActor) {
    super()

    this.on(LogSchema, logActor)
    this.on(ViewSchema, viewActor)
  }
}

export default new Proxy(LogSystem, {
  construct: async function (LogSystem) {
    const logActor = await new LogActor()
    const viewActor = await new ViewActor()

    return new LogSystem(logActor, viewActor)
  }
})

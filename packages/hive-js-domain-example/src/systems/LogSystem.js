// imports
import { System } from 'hive-io'

import ViewSchema from '../schemas/json/View.json'

import ViewActor from '../actors/ViewActor'

/*
 * class LogSystem
 */
class LogSystem extends System {
  constructor (viewActor) {
    super()

    this.on(ViewSchema, viewActor)
  }
}

export default new Proxy(LogSystem, {
  construct: async function (LogSystem) {
    const viewActor = await new ViewActor()

    return new LogSystem(viewActor)
  }
})

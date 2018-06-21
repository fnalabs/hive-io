// imports
import http from 'http'
import { parse, Actor } from 'hive-io'

import CONSTANTS from '../constants'

// constants
const OPTIONS = {
  host: CONSTANTS.VIEW_HOST,
  port: CONSTANTS.VIEW_PORT,
  path: '/posts/',
  method: 'PATCH'
}

/*
 * class ViewActor
 */
class ViewActor extends Actor {
  constructor () {
    super(parse`/views`)
  }

  async perform (model) {
    OPTIONS.path = `/posts/${model.id}`
    http.request(OPTIONS).end()
  }
}

/*
 * Proxy<ViewActor>
 */
export default new Proxy(ViewActor, {
  construct: async function (ViewActor) { return new ViewActor() }
})

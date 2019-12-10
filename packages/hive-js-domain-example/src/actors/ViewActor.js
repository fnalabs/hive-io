// imports
import http from 'http'
import { Actor } from 'hive-io'

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
export default class ViewActor extends Actor {
  async perform (model) {
    OPTIONS.path = `/posts/${model.id}`
    http.request(OPTIONS).end()
  }
}

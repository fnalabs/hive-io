// imports
import { Actor } from 'hive-io'

import httpConnect from '../util/httpConnect'

// constants
const HEADERS = {
  ':method': 'PATCH'
}

/*
 * class ViewActor
 */
export default class ViewActor extends Actor {
  constructor () {
    super()

    this.client = httpConnect()
  }

  async perform (model) {
    HEADERS[':path'] = `/posts/${model.id}`

    this.client.request(HEADERS).end()
  }
}

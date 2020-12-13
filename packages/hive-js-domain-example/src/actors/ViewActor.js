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
  connection = null

  onEnd = () => {
    this.connection.close()
    this.connection = null
  }

  async perform (model) {
    this.connection = httpConnect()

    HEADERS[':path'] = `/contents/${model.id}`
    if (model.traceparent) HEADERS.traceparent = model.traceparent

    const request = this.connection.request(HEADERS)
    request.setEncoding('utf8')
    request.on('end', this.onEnd)
    request.end()
  }
}

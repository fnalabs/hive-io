import logger from 'fluent-logger'

import { FLUENTD_HOST, FLUENTD_PORT, FLUENTD_TIMEOUT, FLUENTD_RECONNECT } from '../config'

export default function fluentConnect () {
  const log = logger.createFluentSender('request', {
    host: FLUENTD_HOST,
    port: FLUENTD_PORT,
    timeout: FLUENTD_TIMEOUT,
    reconnectInterval: FLUENTD_RECONNECT
  })
  return log
}

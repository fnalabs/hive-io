import CONSTANTS from '../constants'
import logger from 'fluent-logger'

export default function fluentConnect () {
  const log = logger.createFluentSender('request', {
    host: CONSTANTS.FLUENTD_HOST,
    port: CONSTANTS.FLUENTD_PORT,
    timeout: CONSTANTS.FLUENTD_TIMEOUT,
    reconnectInterval: CONSTANTS.FLUENTD_RECONNECT
  })
  return log
}

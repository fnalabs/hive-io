// imports
import { Producer } from 'node-rdkafka'

// private properties
const PRODUCER = Symbol('Kafka Producer')
const TOPIC = Symbol('Topic')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG) {
    this[TOPIC] = CONFIG.EVENT_STORE_TOPIC

    this[PRODUCER] = new Producer({
      'metadata.broker.list': CONFIG.EVENT_STORE_URL,
      'client.id': CONFIG.EVENT_STORE_ID,
      'compression.codec': CONFIG.EVENT_STORE_TYPE,
      'queue.buffering.max.ms': CONFIG.EVENT_STORE_BUFFER,
      'socket.keepalive.enable': true
    })
    this[PRODUCER].setPollInterval(CONFIG.EVENT_STORE_POLL_INTERVAL)
    this[PRODUCER].connect()

    /* istanbul ignore next */
    this[PRODUCER].on('event.error', err => console.error(err))
  }

  async log (id, model) {
    return new Promise((resolve, reject) => {
      const message = model.toJSON()
      const queued = this[PRODUCER].produce(this[TOPIC], null, Buffer.from(JSON.stringify(message)), id)
      return queued ? resolve(queued) : reject(queued)
    })
  }
}

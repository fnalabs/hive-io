// imports
import { Producer, KafkaConsumer } from 'node-rdkafka'

// private properties
const PRODUCER = Symbol('Kafka HighLevelProducer')
const CONSUMER = Symbol('Kafka ConsumerGroup')
const TOPIC = Symbol('Topic config definition')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG, connectionType) {
    if (CONFIG.PROCESSOR_TYPE !== 'consumer') {
      this[TOPIC] = CONFIG.PRODUCER_TOPIC

      this[PRODUCER] = new Producer({
        'metadata.broker.list': CONFIG.EVENT_STORE_URL,
        'client.id': CONFIG.EVENT_STORE_ID,
        'compression.codec': CONFIG.EVENT_STORE_TYPE,
        'queue.buffering.max.ms': CONFIG.EVENT_STORE_BUFFER,
        'socket.keepalive.enable': true
      })
      this[PRODUCER].connect()

      /* istanbul ignore next */
      this[PRODUCER].on('event.error', err => console.error(err))
    }

    if (CONFIG.PROCESSOR_TYPE !== 'producer' && typeof CONFIG.CONSUMER_TOPIC === 'string') {
      this[CONSUMER] = new KafkaConsumer({
        'metadata.broker.list': CONFIG.EVENT_STORE_URL,
        'group.id': `${CONFIG.EVENT_STORE_ID}_group`,
        'partition.assignment.strategy': CONFIG.EVENT_STORE_PROTOCOL,
        'auto.offset.reset': CONFIG.EVENT_STORE_OFFSET,
        'socket.keepalive.enable': true
      })
      this[CONSUMER].connect()
      this[CONSUMER].on('ready', () => {
        this[CONSUMER].subscribe([CONFIG.CONSUMER_TOPIC])
        this[CONSUMER].consume()
      })
    }
  }

  get consumer () {
    return this[CONSUMER]
  }

  async log (id, event) {
    return new Promise((resolve, reject) => {
      const message = event.toJSON()
      message.meta.id = id
      message.meta.timestamp = Date.now()

      const queued = this[PRODUCER].produce(this[TOPIC], null, Buffer.from(JSON.stringify(message)), id)
      return queued ? resolve(queued) : reject(queued)
    })
  }
}

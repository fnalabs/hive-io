// imports
import uuidV4 from 'uuid/v4'
import { Client, ConsumerGroup, HighLevelProducer } from 'kafka-node'

// private properties
const CLIENT = Symbol('Kafka client connection')
const PRODUCER = Symbol('Kafka HighLevelProducer')
const CONSUMER = Symbol('Kafka ConsumerGroup')
const TOPIC = Symbol('Topic config definition')

// private methods
const CLOSE = Symbol('closing the Kafka consumer/client')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG, connectionType) {
    if (CONFIG.PROCESSOR_TYPE !== 'consumer') {
      this[TOPIC] = CONFIG.PRODUCER_TOPIC

      this[CLIENT] = new Client(CONFIG.EVENT_STORE_URL, `${CONFIG.EVENT_STORE_ID}-${uuidV4()}`)
      this[PRODUCER] = new HighLevelProducer(this[CLIENT], {
        partitionerType: CONFIG.EVENT_STORE_TYPE
      })

      // NOTE: this is required for our HighLevelProducer with KeyedPartitioner usage
      //        to resolve errors on first send on a fresh instance. see:
      //          - https://www.npmjs.com/package/kafka-node#highlevelproducer-with-keyedpartitioner-errors-on-first-send
      //          - https://github.com/SOHU-Co/kafka-node/issues/354
      //          - https://github.com/SOHU-Co/kafka-node/pull/378
      /* istanbul ignore next */
      this[CLIENT].refreshMetadata([this[TOPIC]], () => {})
    } else {
      this[TOPIC] = null
      this[CLIENT] = null
      this[PRODUCER] = null
    }

    // NOTE to make consumer rebuild from the earliest log for development, you must make groupId unique
    //      e.g. `${CONFIG.EVENT_STORE_ID}-${uuidV4()}` instead of just CONFIG.EVENT_STORE_ID
    this[CONSUMER] = CONFIG.PROCESSOR_TYPE === 'producer' && typeof CONFIG.CONSUMER_TOPIC !== 'string'
      ? null
      : new ConsumerGroup({
        host: CONFIG.EVENT_STORE_URL,
        groupId: `${CONFIG.EVENT_STORE_ID}-${uuidV4()}`,
        sessionTimeout: CONFIG.EVENT_STORE_TIMEOUT,
        protocol: [CONFIG.EVENT_STORE_PROTOCOL],
        fromOffset: CONFIG.EVENT_STORE_OFFSET
      }, CONFIG.CONSUMER_TOPIC)

    // NOTE: this is required for restarts as the consumer connection must be closed. for more info, see:
    //        https://www.npmjs.com/package/kafka-node#failedtorebalanceconsumererror-exception-node_exists-110
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGUSR2')
    process.on('SIGINT', this[CLOSE])
    process.on('SIGUSR2', this[CLOSE])
  }

  get consumer () {
    return this[CONSUMER]
  }

  async log (id, event) {
    await new Promise((resolve, reject) => {
      const message = event.toJSON()
      message.meta.id = id
      message.meta.timestamp = Date.now()

      this[PRODUCER].send([{
        topic: this[TOPIC],
        key: id,
        messages: JSON.stringify(message),
        attributes: 1
      }], (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  /* istanbul ignore next */
  [CLOSE] () {
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGUSR2')

    if (this[CLIENT]) {
      this[CLIENT].close(() => {
        !this[CONSUMER]
          ? process.kill(process.pid)
          : this[CONSUMER].close(true, () => process.kill(process.pid))
      })
    } else if (this[CONSUMER]) this[CONSUMER].close(true, () => process.kill(process.pid))
    else process.kill(process.pid)
  }
}

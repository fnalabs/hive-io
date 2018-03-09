// imports
import uuidV4 from 'uuid/v4'
import { Client, HighLevelProducer } from 'kafka-node'

// private properties
const CLIENT = Symbol('Kafka client connection')
const PRODUCER = Symbol('Kafka HighLevelProducer')
const TOPIC = Symbol('Topic config definition')

// private methods
const CLOSE = Symbol('closing the Kafka consumer/client')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG) {
    this[TOPIC] = CONFIG.EVENT_STORE_TOPIC
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

    // NOTE: this is required for restarts as the consumer connection must be closed. for more info, see:
    //        https://www.npmjs.com/package/kafka-node#failedtorebalanceconsumererror-exception-node_exists-110
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGUSR2')
    process.on('SIGINT', this[CLOSE])
    process.on('SIGUSR2', this[CLOSE])
  }

  async log (model) {
    return new Promise((resolve, reject) => {
      const message = model.toJSON()
      message.meta.timestamp = Date.now()

      this[PRODUCER].send([{
        topic: this[TOPIC],
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

    this[CLIENT].close(() => {
      process.kill(process.pid)
    })
  }
}

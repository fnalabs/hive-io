// imports
import uuidV4 from 'uuid/v4'
import { Client, ConsumerGroup } from 'kafka-node'
import { Observable } from 'rxjs/Rx'

// private properties
const CLIENT = Symbol('Kafka client connection')
const CONSUMER = Symbol('Kafka ConsumerGroup')

// private methods
const CLOSE = Symbol('closing Kafka consumer/client')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG, actor) {
    // NOTE to make consumer rebuild from the earliest log for development, you must make groupId unique
    //      e.g. `${CONFIG.EVENT_STORE_ID}-${uuidV4()}` instead of just CONFIG.EVENT_STORE_ID
    this[CLIENT] = new Client(CONFIG.EVENT_STORE_URL, `${CONFIG.EVENT_STORE_ID}-${uuidV4()}`)
    this[CONSUMER] = new ConsumerGroup({
      host: CONFIG.EVENT_STORE_URL,
      groupId: `${CONFIG.EVENT_STORE_ID}-${uuidV4()}`,
      sessionTimeout: CONFIG.EVENT_STORE_TIMEOUT,
      protocol: [CONFIG.EVENT_STORE_PROTOCOL],
      fromOffset: CONFIG.EVENT_STORE_OFFSET
    }, CONFIG.AGGREGATE_LIST)

    // NOTE: this is required for our HighLevelProducer with KeyedPartitioner usage
    //        to resolve errors on first send on a fresh instance. see:
    //          - https://www.npmjs.com/package/kafka-node#highlevelproducer-with-keyedpartitioner-errors-on-first-send
    //          - https://github.com/SOHU-Co/kafka-node/issues/354
    //          - https://github.com/SOHU-Co/kafka-node/pull/378
    /* istanbul ignore next */
    this[CLIENT].refreshMetadata(CONFIG.AGGREGATE_LIST, () => {})

    // NOTE: this is required for restarts as the consumer connection must be closed. for more info, see:
    //        https://www.npmjs.com/package/kafka-node#failedtorebalanceconsumererror-exception-node_exists-110
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGUSR2')
    process.on('SIGINT', this[CLOSE])
    process.on('SIGUSR2', this[CLOSE])

    // bootstrap event observer
    /* istanbul ignore next */
    Observable
      .fromEventPattern(handler => this[CONSUMER].on('message', handler))
      .concatMap(event => Observable.fromPromise(actor.perform(JSON.parse(event.value))))
      .subscribe(() => {})
  }

  /* istanbul ignore next */
  [CLOSE] () {
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGUSR2')

    this[CONSUMER].close(true, () => {
      this[CLIENT].close(() => {
        process.kill(process.pid)
      })
    })
  }
}

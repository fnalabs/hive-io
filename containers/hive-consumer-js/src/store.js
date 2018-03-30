// imports
import { KafkaConsumer } from 'node-rdkafka'
import { Observable } from 'rxjs/Rx'

// private properties
const CONSUMER = Symbol('Kafka Consumer')

/*
 * EventStore class
 */
export default class EventStore {
  constructor (CONFIG, actor) {
    this[CONSUMER] = new KafkaConsumer({
      'metadata.broker.list': CONFIG.EVENT_STORE_URL,
      'group.id': CONFIG.EVENT_STORE_ID,
      'partition.assignment.strategy': CONFIG.EVENT_STORE_PROTOCOL,
      'auto.offset.reset': CONFIG.EVENT_STORE_OFFSET,
      'socket.keepalive.enable': true
    })
    this[CONSUMER].connect()
    this[CONSUMER].on('ready', () => {
      this[CONSUMER].subscribe(CONFIG.AGGREGATE_LIST)
      this[CONSUMER].consume()
    })

    // bootstrap event observer
    /* istanbul ignore next */
    Observable
      .fromEventPattern(handler => this[CONSUMER].on('data', handler))
      .concatMap(event => Observable.fromPromise(actor.perform(JSON.parse(event.value))))
      .subscribe(() => {})
  }
}

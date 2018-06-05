// imports
import { KafkaConsumer } from 'node-rdkafka'
import { from, fromEventPattern } from 'rxjs'
import { concatMap } from 'rxjs/operators'

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
    fromEventPattern(handler => this[CONSUMER].on('data', handler))
      .pipe(concatMap(event => {
        return from(actor.perform(undefined, JSON.parse(event.value.toString())))
      }))
      .subscribe(() => {})
  }
}

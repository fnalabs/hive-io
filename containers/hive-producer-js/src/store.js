// imports
import CONFIG from '../conf/appConfig'

import { Kafka, CompressionTypes } from 'kafkajs'

// private properties
const MESSAGES = Symbol('Kafka messages')
const PRODUCER = Symbol('Kafka Producer')
const TIMEOUT = Symbol('Kafka timeout')
const TOPIC = Symbol('Topic')

const DISCONNECT = Symbol('method to disconnect from Kafka')
const RESET = Symbol('method to reset buffer')
const RECORD_TIMEOUT = Symbol('method to handle record timeouts')

/*
 * EventStore class
 * TODO: add support for transactions
 * TODO: add support for SSL (maybe SASL)
 */
export default class EventStore {
  constructor () {
    this[TOPIC] = CONFIG.EVENT_STORE_TOPIC
    this[PRODUCER] = new Kafka({
      clientId: CONFIG.EVENT_STORE_ID,
      brokers: CONFIG.EVENT_STORE_BROKERS.split(',')
    }).producer()

    // error handling
    const errorTypes = ['unhandledRejection', 'uncaughtException']
    errorTypes.forEach(type => process.once(type, this[DISCONNECT](type)))
    const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
    signalTraps.forEach(type => process.once(type, this[DISCONNECT](type)))

    this[RESET]()
  }

  async produce () {
    await this[PRODUCER].connect()
  }

  async record (meta, model) {
    if (!this[TIMEOUT]) this[TIMEOUT] = setTimeout(this[RECORD_TIMEOUT], CONFIG.EVENT_STORE_TIMEOUT)

    this[MESSAGES].push({ ...meta, value: JSON.stringify(model) })

    if (this[MESSAGES].length >= CONFIG.EVENT_STORE_BUFFER) {
      clearTimeout(this[TIMEOUT])

      return this[RECORD_TIMEOUT]()
    }
  }

  [DISCONNECT] = type => {
    const handleError = async () => {
      try {
        await this[PRODUCER].disconnect()
      } catch (_) {}

      console.error(`${CONFIG.EVENT_STORE_ID}: ${type} occurred, disconnecting`)
    }

    return handleError
  }

  [RECORD_TIMEOUT] = async () => {
    try {
      await this[PRODUCER].send({
        topic: this[TOPIC],
        messages: this[MESSAGES],
        compression: CompressionTypes.GZIP
      })

      this[RESET]()
    } catch (e) {
      console.error(`${CONFIG.EVENT_STORE_ID}: ${e}`)
    }
  }

  [RESET] = () => {
    this[MESSAGES] = []
    this[TIMEOUT] = null
  }
}

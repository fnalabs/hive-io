// imports
import CONFIG from '../conf/appConfig'

import { Kafka, CompressionTypes } from 'kafkajs'

// private properties
const CONSUMER = Symbol('Kafka Consumer')
const MESSAGES = Symbol('Kafka messages')
const PRODUCER = Symbol('Kafka Producer')
const TIMEOUT = Symbol('Kafka timeout')
const TOPIC = Symbol('Topic')

const DISCONNECT = Symbol('method to disconnect from Kafka')
const RESET = Symbol('method to reset buffer')
const RECORD_TIMEOUT = Symbol('method to handle record timeouts')

const isConsumer = CONFIG.PROCESSOR_TYPE === 'consumer'
const isProducer = CONFIG.PROCESSOR_TYPE === 'producer'
const isStreamProcessor = CONFIG.PROCESSOR_TYPE === 'stream_processor'
const topicRegExp = CONFIG.EVENT_STORE_CONSUMER_TOPIC
  ? new RegExp(CONFIG.EVENT_STORE_CONSUMER_TOPIC)
  : null

/*
 * EventStore class
 * TODO: add support for transactions
 * TODO: add support for SSL (maybe SASL)
 */
export default class EventStore {
  constructor () {
    // create Kafka client
    const kafka = new Kafka({
      clientId: CONFIG.EVENT_STORE_ID,
      brokers: CONFIG.EVENT_STORE_BROKERS.split(',')
    })

    if (isProducer || isStreamProcessor) {
      this[TOPIC] = CONFIG.EVENT_STORE_PRODUCER_TOPIC
      this[PRODUCER] = kafka.producer()

      this[RESET]()
    }

    if ((isConsumer || isStreamProcessor) && topicRegExp) {
      this[CONSUMER] = kafka.consumer({ groupId: CONFIG.EVENT_STORE_GROUP_ID })
    }

    // error handling
    const errorTypes = ['unhandledRejection', 'uncaughtException']
    errorTypes.forEach(type => process.once(type, this[DISCONNECT](type)))
    const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
    signalTraps.forEach(type => process.once(type, this[DISCONNECT](type)))
  }

  async consume (handler) {
    // connect to Kafka
    await this[CONSUMER].connect()
    // subscribe to topic(s)
    await this[CONSUMER].subscribe({
      topic: topicRegExp,
      fromBeginning: CONFIG.EVENT_STORE_FROM_START
    })
    // and start consuming events
    await this[CONSUMER].run({
      autoCommitInterval: CONFIG.EVENT_STORE_TIMEOUT,
      autoCommitThreshold: CONFIG.EVENT_STORE_BUFFER,
      partitionsConsumedConcurrently: CONFIG.EVENT_STORE_PARTITIONS,
      eachMessage: handler
    })
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
        if (isProducer || isStreamProcessor) await this[PRODUCER].disconnect()
        if (isConsumer || isStreamProcessor) await this[CONSUMER].disconnect()
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

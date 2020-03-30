// imports
import {
  PROCESSOR_TYPE,
  EVENT_STORE_CONSUMER_TOPIC,
  EVENT_STORE_PRODUCER_TOPIC,
  EVENT_STORE_ID,
  EVENT_STORE_GROUP_ID,
  EVENT_STORE_BROKERS,
  EVENT_STORE_FROM_START,
  EVENT_STORE_PARTITIONS,
  EVENT_STORE_BUFFER,
  EVENT_STORE_TIMEOUT
} from './config'

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

const isConsumer = PROCESSOR_TYPE === 'consumer'
const isProducer = PROCESSOR_TYPE === 'producer'
const isStreamProcessor = PROCESSOR_TYPE === 'stream_processor'
const topicRegExp = EVENT_STORE_CONSUMER_TOPIC
  ? new RegExp(EVENT_STORE_CONSUMER_TOPIC)
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
      clientId: EVENT_STORE_ID,
      brokers: EVENT_STORE_BROKERS.split(',')
    })

    if (isProducer || isStreamProcessor) {
      this[TOPIC] = EVENT_STORE_PRODUCER_TOPIC
      this[PRODUCER] = kafka.producer()

      this[RESET]()
    }

    if ((isConsumer || isStreamProcessor) && topicRegExp) {
      this[CONSUMER] = kafka.consumer({ groupId: EVENT_STORE_GROUP_ID })
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
      fromBeginning: EVENT_STORE_FROM_START
    })
    // and start consuming events
    await this[CONSUMER].run({
      autoCommitInterval: EVENT_STORE_TIMEOUT,
      autoCommitThreshold: EVENT_STORE_BUFFER,
      partitionsConsumedConcurrently: EVENT_STORE_PARTITIONS,
      eachMessage: handler
    })
  }

  async produce () {
    await this[PRODUCER].connect()
  }

  async record (meta, model) {
    if (!this[TIMEOUT]) this[TIMEOUT] = setTimeout(this[RECORD_TIMEOUT], EVENT_STORE_TIMEOUT)

    this[MESSAGES].push({ ...meta, value: JSON.stringify(model) })

    if (this[MESSAGES].length >= EVENT_STORE_BUFFER) {
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

      console.error(`${EVENT_STORE_ID}: ${type} occurred, disconnecting`)
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
      console.error(`${EVENT_STORE_ID}: ${e}`)
    }
  }

  [RESET] = () => {
    this[MESSAGES] = []
    this[TIMEOUT] = null
  }
}

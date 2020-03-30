// imports
import {
  EVENT_STORE_TOPIC,
  EVENT_STORE_ID,
  EVENT_STORE_GROUP_ID,
  EVENT_STORE_BROKERS,
  EVENT_STORE_FROM_START,
  EVENT_STORE_PARTITIONS,
  EVENT_STORE_BUFFER,
  EVENT_STORE_TIMEOUT
} from './config'

import { Kafka } from 'kafkajs'

const topicRegExp = new RegExp(EVENT_STORE_TOPIC)

// private properties
const CONSUMER = Symbol('Kafka Consumer')

const DISCONNECT = Symbol('method to disconnect from Kafka')

/*
 * EventStore class
 * TODO: add support for SSL (maybe SASL)
 */
export default class EventStore {
  constructor () {
    // create Kafka client and consumer
    this[CONSUMER] = new Kafka({
      clientId: EVENT_STORE_ID,
      brokers: EVENT_STORE_BROKERS.split(',')
    }).consumer({ groupId: EVENT_STORE_GROUP_ID })

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

  [DISCONNECT] = type => {
    const handleError = async () => {
      try {
        await this[CONSUMER].disconnect()
      } catch (_) {}

      console.error(`${EVENT_STORE_GROUP_ID}/${EVENT_STORE_ID}: ${type} occurred, disconnecting`)
    }

    return handleError
  }
}

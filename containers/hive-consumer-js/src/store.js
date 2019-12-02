// imports
import CONFIG from '../conf/appConfig'

import { Kafka } from 'kafkajs'

const topicRegExp = new RegExp(CONFIG.EVENT_STORE_TOPIC)

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
      clientId: CONFIG.EVENT_STORE_ID,
      brokers: CONFIG.EVENT_STORE_BROKERS.split(',')
    }).consumer({ groupId: CONFIG.EVENT_STORE_GROUP_ID })

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

  [DISCONNECT] = type => {
    const handleError = async () => {
      try {
        await this[CONSUMER].disconnect()
      } catch (_) {}

      console.error(`${CONFIG.EVENT_STORE_GROUP_ID}/${CONFIG.EVENT_STORE_ID}: ${type} occurred, disconnecting`)
    }

    return handleError
  }
}

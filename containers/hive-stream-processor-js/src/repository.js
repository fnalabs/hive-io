// imports
import {
  CACHE_URL,
  LOCK_TTL,
  LOCK_DRIFT_FACTOR,
  LOCK_RETRY_COUNT,
  LOCK_RETRY_DELAY,
  LOCK_RETRY_JITTER
} from './config'

import Redis from 'ioredis'
import Redlock from 'redlock'

// private properties
const CACHE = Symbol('cache client connection')
const LOCK = Symbol('pessimistic locking connection')
const STORE = Symbol('Event Store client connection')
const TTL = Symbol('Redlock TTL')

/*
 * Repository class
 */
export default class Repository {
  constructor (store) {
    this[TTL] = LOCK_TTL
    this[CACHE] = new Redis(CACHE_URL)
    this[LOCK] = new Redlock([this[CACHE]], {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: LOCK_DRIFT_FACTOR, // time in ms
      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount: LOCK_RETRY_COUNT,
      // the time in ms between attempts
      retryDelay: LOCK_RETRY_DELAY, // time in ms
      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
      retryJitter: LOCK_RETRY_JITTER // time in ms
    })
    this[STORE] = store

    // handle client errors
    /* istanbul ignore next */
    this[CACHE].on('error', err => console.log('A redis error has occurred:', err))
    /* istanbul ignore next */
    this[LOCK].on('clientError', err => console.log('A redlock error has occurred:', err))

    // quit connection if process is interrupted
    process.on('SIGINT', this[CACHE].quit)
    process.on('SIGUSR2', this[CACHE].quit)
  }

  async delete (id) {
    return this[CACHE].del(id)
  }

  async get (id) {
    const dataString = await this[CACHE].get(id)
    if (dataString) return dataString
  }

  async record (meta, event, model, cache) {
    const lock = await this[LOCK].lock(`lock:${model.id}`, this[TTL])

    try {
      await this[CACHE].set(model.id, JSON.stringify(model))
      await this[STORE].record(meta, event)
    } catch (e) {
      cache
        ? await this[CACHE].set(model.id, cache)
        : await this[CACHE].del(model.id)
      lock.unlock()

      throw new Error(e.message)
    }

    return lock.unlock()
  }

  async update (model) {
    const lock = await this[LOCK].lock(`lock:${model.id}`, this[TTL])
    await this[CACHE].set(model.id, JSON.stringify(model))
    return lock.unlock()
  }
}

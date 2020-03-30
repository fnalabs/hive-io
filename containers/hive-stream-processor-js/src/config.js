// server configurations
export const NODE_ENV = process.env.NODE_ENV ?? 'production'
export const PORT = Number.parseInt(process.env.PORT, 10) || 3000
export const HTTP_VERSION = Number.parseInt(process.env.HTTP_VERSION, 10) || 2
export const SECURE = process.env.SECURE === 'true'
export const CLUSTER_SIZE = process.env.CLUSTER_SIZE
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH ?? '/opt/app/cert/ssl-cert.pem'
export const SSL_KEY_PATH = process.env.SSL_KEY_PATH ?? '/opt/app/cert/ssl-key.pem'

// service configurations
export const CONTENT_TYPE = process.env.CONTENT_TYPE ?? 'application/json'
export const PING_URL = process.env.PING_URL ?? '/ping'
export const PROCESSOR_TYPE = process.env.PROCESSOR_TYPE ?? 'producer'

// actor configurations
export const ACTOR = process.env.ACTOR
export const ACTOR_LIB = process.env.ACTOR_LIB

// event store configurations
export const EVENT_STORE_PRODUCER_TOPIC = process.env.EVENT_STORE_PRODUCER_TOPIC
export const EVENT_STORE_CONSUMER_TOPIC = process.env.EVENT_STORE_CONSUMER_TOPIC
export const EVENT_STORE_ID = process.env.EVENT_STORE_ID
export const EVENT_STORE_GROUP_ID = process.env.EVENT_STORE_GROUP_ID

// TODO = add support for transactions
// EVENT_STORE_TRANS_ID = process.env.EVENT_STORE_TRANS_ID
export const EVENT_STORE_BROKERS = process.env.EVENT_STORE_BROKERS
export const EVENT_STORE_FROM_START = process.env.EVENT_STORE_FROM_START === 'true'
export const EVENT_STORE_PARTITIONS = Number.parseInt(process.env.EVENT_STORE_PARTITIONS, 10) || 1
export const EVENT_STORE_BUFFER = Number.parseInt(process.env.EVENT_STORE_BUFFER, 10) || 100
export const EVENT_STORE_TIMEOUT = Number.parseInt(process.env.EVENT_STORE_TIMEOUT, 10) || 2000

// snapshot storage configurations
export const CACHE_URL = process.env.CACHE_URL
export const LOCK_TTL = Number.parseInt(process.env.LOCK_TTL, 10) || 2000
export const LOCK_DRIFT_FACTOR = Number.parseFloat(process.env.LOCK_DRIFT_FACTOR) || 0.01
export const LOCK_RETRY_COUNT = Number.parseInt(process.env.LOCK_RETRY_COUNT, 10) || 0
export const LOCK_RETRY_DELAY = Number.parseInt(process.env.LOCK_RETRY_DELAY, 10) || 400
export const LOCK_RETRY_JITTER = Number.parseInt(process.env.LOCK_RETRY_JITTER, 10) || 400

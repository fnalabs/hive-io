module.exports = Object.freeze({
  // server configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number.parseInt(process.env.PORT, 10) || 3000,
  HTTP_VERSION: Number.parseInt(process.env.HTTP_VERSION, 10) || 2,
  SECURE: process.env.SECURE === 'true',
  CLUSTER_SIZE: process.env.CLUSTER_SIZE,
  PROCESSOR_TYPE: process.env.PROCESSOR_TYPE || 'producer',
  // service configurations
  CONTENT_TYPE: process.env.CONTENT_TYPE || 'application/json',
  PING_URL: process.env.PING_URL || '/ping',
  // actor configurations
  ACTOR: process.env.ACTOR,
  ACTOR_LIB: process.env.ACTOR_LIB,
  // event store configurations
  EVENT_STORE_PRODUCER_TOPIC: process.env.EVENT_STORE_PRODUCER_TOPIC,
  EVENT_STORE_CONSUMER_TOPIC: process.env.EVENT_STORE_CONSUMER_TOPIC,
  EVENT_STORE_ID: process.env.EVENT_STORE_ID,
  EVENT_STORE_GROUP_ID: process.env.EVENT_STORE_GROUP_ID,
  // TODO: add support for transactions
  // EVENT_STORE_TRANS_ID: process.env.EVENT_STORE_TRANS_ID,
  EVENT_STORE_BROKERS: process.env.EVENT_STORE_BROKERS,
  EVENT_STORE_FROM_START: process.env.EVENT_STORE_FROM_START === 'true',
  EVENT_STORE_PARTITIONS: Number.parseInt(process.env.EVENT_STORE_PARTITIONS, 10) || 1,
  EVENT_STORE_BUFFER: Number.parseInt(process.env.EVENT_STORE_BUFFER, 10) || 100,
  EVENT_STORE_TIMEOUT: Number.parseInt(process.env.EVENT_STORE_TIMEOUT, 10) || 2000,
  // snapshot storage configurations
  CACHE_URL: process.env.CACHE_URL,
  LOCK_TTL: process.env.LOCK_TTL || 2000,
  LOCK_DRIFT_FACTOR: process.env.LOCK_DRIFT_FACTOR || 0.01,
  LOCK_RETRY_COUNT: process.env.LOCK_RETRY_COUNT || 0,
  LOCK_RETRY_DELAY: process.env.LOCK_RETRY_DELAY || 400,
  LOCK_RETRY_JITTER: process.env.LOCK_RETRY_JITTER || 400
})

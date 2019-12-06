module.exports = Object.freeze({
  // server configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number.parseInt(process.env.PORT, 10) || 3000,
  HTTP_VERSION: Number.parseInt(process.env.HTTP_VERSION, 10) || 2,
  SECURE: process.env.SECURE === 'true',
  CLUSTER_SIZE: process.env.CLUSTER_SIZE,
  // service configurations
  PING_URL: process.env.PING_URL || '/ping',
  // actor configurations
  ACTOR: process.env.ACTOR,
  ACTOR_LIB: process.env.ACTOR_LIB,
  // event store configurations
  EVENT_STORE_TOPIC: process.env.EVENT_STORE_TOPIC,
  EVENT_STORE_ID: process.env.EVENT_STORE_ID,
  EVENT_STORE_GROUP_ID: process.env.EVENT_STORE_GROUP_ID,
  EVENT_STORE_BROKERS: process.env.EVENT_STORE_BROKERS,
  EVENT_STORE_FROM_START: process.env.EVENT_STORE_FROM_START === 'true',
  EVENT_STORE_PARTITIONS: Number.parseInt(process.env.EVENT_STORE_PARTITIONS, 10) || 1,
  EVENT_STORE_BUFFER: Number.parseInt(process.env.EVENT_STORE_BUFFER, 10) || null,
  EVENT_STORE_TIMEOUT: Number.parseInt(process.env.EVENT_STORE_TIMEOUT, 10) || null
})

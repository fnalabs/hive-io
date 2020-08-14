module.exports = Object.freeze({
  // application configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 3000,
  // domain configurations
  AGGREGATE_LIST: (process.env.AGGREGATE_LIST && process.env.AGGREGATE_LIST.split(',')) || ['content', 'view'],
  // actor configurations
  ACTOR: process.env.ACTOR || 'PostActor',
  ACTOR_LIB: process.env.ACTOR_LIB || 'hive-io-domain-example',
  // event store configurations
  EVENT_STORE_ID: process.env.EVENT_STORE_ID,
  EVENT_STORE_URL: process.env.EVENT_STORE_URL,
  EVENT_STORE_TIMEOUT: process.env.EVENT_STORE_TIMEOUT || 15000,
  EVENT_STORE_PROTOCOL: process.env.EVENT_STORE_PROTOCOL || 'roundrobin',
  EVENT_STORE_OFFSET: process.env.EVENT_STORE_OFFSET || 'latest'
})

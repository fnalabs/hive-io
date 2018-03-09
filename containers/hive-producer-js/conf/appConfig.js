module.exports = Object.freeze({
  // application configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 3000,
  // domain configurations
  ACTOR: process.env.ACTOR || 'ViewActor',
  ACTOR_LIB: process.env.ACTOR_LIB || 'hive-io-domain-example',
  // storage configurations
  EVENT_STORE_TOPIC: process.env.EVENT_STORE_TOPIC || 'view',
  EVENT_STORE_ID: process.env.EVENT_STORE_ID,
  EVENT_STORE_URL: process.env.EVENT_STORE_URL,
  EVENT_STORE_TYPE: process.env.EVENT_STORE_TYPE || 2
})

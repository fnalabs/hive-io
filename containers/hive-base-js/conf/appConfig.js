module.exports = Object.freeze({
  // application configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 3000,
  CLUSTER_SIZE: process.env.CLUSTER_SIZE,
  // domain configurations
  ACTOR: process.env.ACTOR || 'PostActor',
  ACTOR_LIB: process.env.ACTOR_LIB || 'hive-io-rest-example'
})

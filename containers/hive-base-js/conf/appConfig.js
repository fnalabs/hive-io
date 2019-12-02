module.exports = Object.freeze({
  // server configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number.parseInt(process.env.PORT, 10) || 3000,
  HTTP_VERSION: Number.parseInt(process.env.HTTP_VERSION, 10) || 2,
  SECURE: process.env.SECURE === 'true',
  CLUSTER_SIZE: process.env.CLUSTER_SIZE,
  // service configurations
  CONTENT_TYPE: process.env.CONTENT_TYPE || 'application/json',
  PING_URL: process.env.PING_URL || '/ping',
  // domain configurations
  ACTOR: process.env.ACTOR,
  ACTOR_LIB: process.env.ACTOR_LIB
})

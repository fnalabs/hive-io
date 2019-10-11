module.exports = Object.freeze({
  // server configurations
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number(process.env.PORT) || 3000,
  HTTP_VER: Number(process.env.HTTP_VER) || 2,
  SECURE: Boolean(process.env.SECURE),
  CLUSTER_SIZE: process.env.CLUSTER_SIZE,
  // service configurations
  CONTENT_TYPE: process.env.CONTENT_TYPE || 'application/json',
  PING_URL: process.env.PING_URL || '/ping',
  // domain configurations
  ACTOR: process.env.ACTOR,
  ACTOR_LIB: process.env.ACTOR_LIB
})

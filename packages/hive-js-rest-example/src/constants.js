export default Object.freeze({
  MONGO_URL: process.env.MONGO_URL,
  FLUENTD_HOST: process.env.FLUENTD_HOST,
  FLUENTD_PORT: process.env.FLUENTD_PORT,
  FLUENTD_TIMEOUT: Number.parseFloat(process.env.FLUENTD_TIMEOUT),
  FLUENTD_RECONNECT: Number.parseInt(process.env.FLUENTD_RECONNECT),
  UPDATE_OPTIONS: Object.freeze({
    new: true
  })
})

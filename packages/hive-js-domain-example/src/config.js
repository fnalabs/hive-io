export const MONGO_URL = process.env.MONGO_URL
export const FLUENTD_HOST = process.env.FLUENTD_HOST
export const FLUENTD_PORT = process.env.FLUENTD_PORT
export const FLUENTD_TIMEOUT = Number.parseFloat(process.env.FLUENTD_TIMEOUT)
export const FLUENTD_RECONNECT = Number.parseInt(process.env.FLUENTD_RECONNECT, 10)
export const SSL_CERT = process.env.SSL_CERT
export const UPDATE_OPTIONS = Object.freeze({
  new: true,
  setDefaultsOnInsert: true,
  upsert: true
})
export const VIEW_URL = process.env.VIEW_URL ?? 'https://hive-producer-js:3000'

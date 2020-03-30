export const MONGO_URL = process.env.MONGO_URL
export const FLUENTD_HOST = process.env.FLUENTD_HOST
export const FLUENTD_PORT = process.env.FLUENTD_PORT
export const FLUENTD_TIMEOUT = Number.parseFloat(process.env.FLUENTD_TIMEOUT)
export const FLUENTD_RECONNECT = Number.parseInt(process.env.FLUENTD_RECONNECT)
export const UPDATE_OPTIONS = Object.freeze({
  new: true
})

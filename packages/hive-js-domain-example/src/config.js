import pkg from '../package.json'

export const TELEMETRY_LIB_NAME = pkg.name
export const TELEMETRY_LIB_VERSION = pkg.version

export const MONGO_URL = process.env.MONGO_URL
export const SECURE = process.env.SECURE === 'true'
export const SSL_CERT = process.env.SSL_CERT
export const UPDATE_OPTIONS = Object.freeze({
  new: true,
  setDefaultsOnInsert: true,
  upsert: true
})
export const VIEW_URL = process.env.VIEW_URL ?? 'https://hive-producer-js:3000'

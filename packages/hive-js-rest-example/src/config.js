import pkg from '../package.json'

export const TELEMETRY_LIB_NAME = pkg.name
export const TELEMETRY_LIB_VERSION = pkg.version

export const MONGO_URL = process.env.MONGO_URL
export const UPDATE_OPTIONS = Object.freeze({
  new: true
})

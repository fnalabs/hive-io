export const MONGO_URL = process.env.MONGO_URL
export const SSL_CERT = process.env.SSL_CERT
export const UPDATE_OPTIONS = Object.freeze({
  new: true,
  setDefaultsOnInsert: true,
  upsert: true
})
export const VIEW_URL = process.env.VIEW_URL ?? 'https://hive-producer-js:3000'

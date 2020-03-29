// server configurations
export const NODE_ENV = process.env.NODE_ENV ?? 'production'
export const PORT = Number.parseInt(process.env.PORT, 10) || 3000
export const HTTP_VERSION = Number.parseInt(process.env.HTTP_VERSION, 10) || 2
export const SECURE = process.env.SECURE === 'true'
export const CLUSTER_SIZE = process.env.CLUSTER_SIZE
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH ?? '/opt/app/cert/ssl-cert.pem'
export const SSL_KEY_PATH = process.env.SSL_KEY_PATH ?? '/opt/app/cert/ssl-key.pem'

// service configurations
export const CONTENT_TYPE = process.env.CONTENT_TYPE ?? 'application/json'
export const PING_URL = process.env.PING_URL ?? '/ping'

// domain configurations
export const ACTOR = process.env.ACTOR
export const ACTOR_LIB = process.env.ACTOR_LIB

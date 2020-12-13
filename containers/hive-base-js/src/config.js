import pkg from '../package.json'

// server configurations
export const NODE_ENV = process.env.NODE_ENV ?? 'production'
export const DEPLOY_ENV = process.env.DEPLOY_ENV ?? NODE_ENV
export const PORT = Number.parseInt(process.env.PORT, 10) || 3000
export const HTTP_VERSION = Number.parseInt(process.env.HTTP_VERSION, 10) || 2
export const SECURE = process.env.SECURE === 'true'
export const CLUSTER_SIZE = process.env.CLUSTER_SIZE
export const SSL_CERT = process.env.SSL_CERT ?? '/opt/app/cert/ssl-cert.pem'
export const SSL_KEY = process.env.SSL_KEY ?? '/opt/app/cert/ssl-key.pem'

// service configurations
export const PING_URL = process.env.PING_URL ?? '/ping'

// domain configurations
export const ACTOR = process.env.ACTOR
export const ACTOR_LIB = process.env.ACTOR_LIB
export const ACTOR_URLS = (typeof process.env.ACTOR_URLS === 'string' && process.env.ACTOR_URLS.length)
  ? process.env.ACTOR_URLS.split(',')
  : []

// telemetry configurations
const DEFAULT_TELEMETRY_PLUGINS = {
  mongodb: { enabled: false },
  grpc: { enabled: false },
  '@grpc/grpc-js': { enabled: false },
  http: { enabled: false },
  https: { enabled: false },
  mysql: { enabled: false },
  pg: { enabled: false },
  redis: { enabled: false },
  ioredis: { enabled: false },
  'pg-pool': { enabled: false },
  express: { enabled: false },
  '@hapi/hapi': { enabled: false },
  koa: { enabled: false },
  dns: { enabled: false }
}

export const TELEMETRY = process.env.TELEMETRY === 'true'
export const TELEMETRY_PLUGINS = process.env.TELEMETRY_PLUGINS?.length
  ? {
      ...DEFAULT_TELEMETRY_PLUGINS,
      ...JSON.parse(process.env.TELEMETRY_PLUGINS)
    }
  : DEFAULT_TELEMETRY_PLUGINS
export const TELEMETRY_SERVICE_NAME = process.env.TELEMETRY_SERVICE_NAME ?? `${pkg.name}-js`
export const TELEMETRY_SERVICE_INSTANCE_ID = process.env.HOSTNAME
export const TELEMETRY_URL_METRICS = process.env.TELEMETRY_URL_METRICS
export const TELEMETRY_URL_TRACES = process.env.TELEMETRY_URL_TRACES

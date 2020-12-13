import { metrics } from '@opentelemetry/api'
import { CollectorMetricExporter, CollectorTraceExporter } from '@opentelemetry/exporter-collector'
import { MeterProvider } from '@opentelemetry/metrics'
import { NodeTracerProvider } from '@opentelemetry/node'
import { BatchSpanProcessor } from '@opentelemetry/tracing'
import { OperatingSystem, OperatingSystemValues } from '@opentelemetry/semantic-conventions'

import {
  DEPLOY_ENV,
  TELEMETRY,
  TELEMETRY_PLUGINS,
  TELEMETRY_SERVICE_NAME,
  TELEMETRY_SERVICE_INSTANCE_ID,
  TELEMETRY_URL_METRICS,
  TELEMETRY_URL_TRACES
} from './config'
import pkg from '../package.json'

const attributes = {
  'container.id': TELEMETRY_SERVICE_INSTANCE_ID,
  'container.image.name': `fnalabs/${pkg.name}-js`,
  'container.image.tag': pkg.version,
  'deployment.environment': DEPLOY_ENV,
  [OperatingSystem.TYPE]: OperatingSystemValues.LINUX,
  [OperatingSystem.DESCRIPTION]: 'Alpine Linux 3.11.6',
  'service.name': TELEMETRY_SERVICE_NAME,
  'service.instance.id': TELEMETRY_SERVICE_INSTANCE_ID
}

// setup metric exporter and provider
const metricExporter = new CollectorMetricExporter({
  url: TELEMETRY_URL_METRICS,
  serviceName: TELEMETRY_SERVICE_NAME,
  attributes
})
const metricProvider = new MeterProvider({
  exporter: TELEMETRY ? metricExporter : null
})
metrics.setGlobalMeterProvider(metricProvider)

// setup traces exporter and provider
const tracesExporter = new CollectorTraceExporter({
  url: TELEMETRY_URL_TRACES,
  serviceName: TELEMETRY_SERVICE_NAME,
  attributes
})
const tracesProvider = new NodeTracerProvider({ plugins: TELEMETRY_PLUGINS })
if (TELEMETRY) tracesProvider.addSpanProcessor(new BatchSpanProcessor(tracesExporter))
tracesProvider.register()

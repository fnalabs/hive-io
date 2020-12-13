/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'

chai.use(chaiAsPromised)
chai.use(dirtyChai)
proxyquire.noCallThru()

const addSpanProcessorSpy = spy()
const registerSpy = spy()
const setGlobalMeterProviderSpy = spy()
const BatchSpanProcessorSpy = spy()

describe('telemetry', () => {
  afterEach(() => {
    addSpanProcessorSpy.resetHistory()
    registerSpy.resetHistory()
    setGlobalMeterProviderSpy.resetHistory()
    BatchSpanProcessorSpy.resetHistory()
  })

  describe('enabled', () => {
    before(() => {
      proxyquire('../src/telemetry', {
        './config': {
          DEPLOY_ENV: 'test',
          TELEMETRY: true,
          TELEMETRY_PLUGINS: {},
          TELEMETRY_SERVICE_NAME: 'test-service',
          TELEMETRY_SERVICE_INSTANCE_ID: 'test-service-instance-id',
          TELEMETRY_URL_METRICS: 'test-url-metrics',
          TELEMETRY_URL_TRACES: 'test-url-traces'
        },
        '../package.json': {
          name: 'test',
          version: 'test'
        },
        '@opentelemetry/api': {
          metrics: { setGlobalMeterProvider: setGlobalMeterProviderSpy }
        },
        '@opentelemetry/exporter-collector': { CollectorMetricExporter: spy(), CollectorTraceExporter: spy() },
        '@opentelemetry/metrics': { MeterProvider: spy() },
        '@opentelemetry/node': {
          NodeTracerProvider: stub().returns({
            addSpanProcessor: addSpanProcessorSpy,
            register: registerSpy
          })
        },
        '@opentelemetry/tracing': { BatchSpanProcessor: BatchSpanProcessorSpy }
      })
    })

    it('should expose api', () => {
      expect(setGlobalMeterProviderSpy.calledOnce).to.be.true()
      expect(registerSpy.calledOnce).to.be.true()

      expect(addSpanProcessorSpy.calledOnce).to.be.true()
      expect(BatchSpanProcessorSpy.calledOnce).to.be.true()
    })
  })

  describe('disabled', () => {
    before(() => {
      proxyquire('../src/telemetry', {
        './config': {
          DEPLOY_ENV: 'test',
          TELEMETRY: false,
          TELEMETRY_PLUGINS: {},
          TELEMETRY_SERVICE_NAME: 'test-service',
          TELEMETRY_SERVICE_INSTANCE_ID: 'test-service-instance-id',
          TELEMETRY_URL_METRICS: 'test-url-metrics',
          TELEMETRY_URL_TRACES: 'test-url-traces'
        },
        '../package.json': {
          name: 'test',
          version: 'test'
        },
        '@opentelemetry/api': {
          metrics: { setGlobalMeterProvider: setGlobalMeterProviderSpy }
        },
        '@opentelemetry/exporter-collector': { CollectorMetricExporter: spy(), CollectorTraceExporter: spy() },
        '@opentelemetry/metrics': { MeterProvider: spy() },
        '@opentelemetry/node': {
          NodeTracerProvider: stub().returns({
            addSpanProcessor: addSpanProcessorSpy,
            register: registerSpy
          })
        },
        '@opentelemetry/tracing': { BatchSpanProcessor: BatchSpanProcessorSpy }
      })
    })

    it('should still expose api, just without exporters', () => {
      expect(setGlobalMeterProviderSpy.calledOnce).to.be.true()
      expect(registerSpy.calledOnce).to.be.true()

      expect(addSpanProcessorSpy.called).to.be.false()
      expect(BatchSpanProcessorSpy.called).to.be.false()
    })
  })
})

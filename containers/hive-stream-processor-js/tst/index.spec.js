/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'

import cors from 'fastify-cors'
import helmet from 'fastify-helmet'

import { SpanKind, StatusCode } from '@opentelemetry/api'
import { HttpAttribute } from '@opentelemetry/semantic-conventions'

chai.use(chaiHttp)
chai.use(dirtyChai)
proxyquire.noCallThru()

// mocks
const requestMock = {
  url: '/test',
  method: 'GET',
  routerPath: '/test',
  headers: {},
  raw: { headers: 'test raw headers' }
}
const replyMock = { raw: {} }
const errorMock = {
  name: 'testError',
  message: 'test message',
  stack: 'test error stack'
}
const fastifyMock = {
  addHook: spy(),
  all: spy(),
  get: spy(),
  register: spy()
}

// spies/stubs
const consumeSpy = spy()
const produceSpy = spy()
const storeRecordSpy = spy()

const repoRecordSpy = spy()
const updateSpy = spy()
const getStub = stub()
getStub.withArgs('unknown').resolves(null)
getStub.withArgs('test').resolves('{ "model": "test" }')

const performStub = stub().resolves({ event: 'test' })
const replayStub = stub().resolves({ model: 'test' })

const doneSpy = spy()

const bindSpy = spy()
const withStub = stub().callsFake(async (_, cb) => cb())

const extractSpy = spy()
const injectSpy = spy()

const addEventSpy = spy()
const endSpy = spy()
const setAttributeSpy = spy()
const setAttributesSpy = spy()
const setStatusSpy = spy()
const startSpanStub = stub().returns({
  addEvent: addEventSpy,
  end: endSpy,
  setAttribute: setAttributeSpy,
  setAttributes: setAttributesSpy,
  setStatus: setStatusSpy
})

const withSpanStub = stub().callsFake((_, cb) => cb())
const getCurrentSpanStub = stub()
  .onFirstCall().returns({ kind: 1 })
  .returns(undefined)
const getTracerStub = stub().returns({
  getCurrentSpan: getCurrentSpanStub,
  startSpan: startSpanStub,
  withSpan: withSpanStub
})

const proxyConfig = {
  './telemetry': {},
  './config': {
    PROCESSOR_TYPE: 'stream_processor',
    ACTOR: 'ContentActor',
    ACTOR_LIB: 'codecov',
    ACTOR_URLS: ['/test/actor'],
    HTTP_VERSION: 2,
    PING_URL: '/test/ping',
    SECURE: true,
    TELEMETRY: true,
    TELEMETRY_SERVICE_NAME: 'test'
  },
  './store': class EventStore {
    async consume () { consumeSpy() }
    async produce () { produceSpy() }
    async record () { storeRecordSpy() }
  },
  './repository': class Repository {
    async get (id) { return getStub(id) }
    async record () { repoRecordSpy() }
    async update () { updateSpy() }
  },
  '@opentelemetry/api': {
    context: { bind: bindSpy, with: withStub },
    propagation: { extract: extractSpy, inject: injectSpy },
    trace: { getTracer: getTracerStub },
    StatusCode,
    SpanKind
  },
  codecov: {
    ContentActor: class Actor {
      async perform () { return performStub() }
      async replay () { return replayStub() }
    }
  }
}

// tests
describe('main', () => {
  let healthHandler, mainHandler, onErrorHook, onRequestHook, onResponseHook

  afterEach(() => {
    consumeSpy.resetHistory()
    produceSpy.resetHistory()

    fastifyMock.addHook.resetHistory()
    fastifyMock.all.resetHistory()
    fastifyMock.get.resetHistory()
    fastifyMock.register.resetHistory()
  })

  describe('PROCESSOR_TYPE: "producer"', () => {
    before(async () => {
      const index = proxyquire('../src', {
        ...proxyConfig,
        './config': {
          ...proxyConfig['./config'],
          PROCESSOR_TYPE: 'producer',
          HTTP_VERSION: 1,
          SECURE: true
        }
      })

      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      onErrorHook = index.onErrorHook
      onRequestHook = index.onRequestHook
      onResponseHook = index.onResponseHook

      await index.default(fastifyMock)
    })

    it('should initialize "producer" processor type correctly', () => {
      expect(fastifyMock.addHook.calledThrice).to.be.true()
      expect(fastifyMock.addHook.firstCall.calledWith('onRequest', onRequestHook)).to.be.true()
      expect(fastifyMock.addHook.secondCall.calledWith('onError', onErrorHook)).to.be.true()
      expect(fastifyMock.addHook.thirdCall.calledWith('onResponse', onResponseHook)).to.be.true()

      expect(consumeSpy.called).to.be.false()
      expect(produceSpy.calledOnce).to.be.true()

      expect(fastifyMock.register.calledTwice).to.be.true()
      expect(fastifyMock.register.firstCall.calledWith(cors)).to.be.true()
      expect(fastifyMock.register.secondCall.calledWith(helmet)).to.be.true()

      expect(fastifyMock.get.calledOnce).to.be.true()
      expect(fastifyMock.get.firstCall.calledWith('/test/ping', healthHandler)).to.be.true()

      expect(fastifyMock.all.calledOnce).to.be.true()
      expect(fastifyMock.all.firstCall.calledWith('/test/actor', mainHandler)).to.be.true()
    })
  })

  describe('PROCESSOR_TYPE: "consumer"', () => {
    before(async () => {
      const index = proxyquire('../src', {
        ...proxyConfig,
        './config': {
          ...proxyConfig['./config'],
          PROCESSOR_TYPE: 'consumer',
          HTTP_VERSION: 1,
          SECURE: false,
          TELEMETRY: false
        }
      })

      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      onErrorHook = index.onErrorHook
      onRequestHook = index.onRequestHook
      onResponseHook = index.onResponseHook

      await index.default(fastifyMock)
    })

    it('should initialize "consumer" processor type correctly', () => {
      expect(fastifyMock.addHook.called).to.be.false()

      expect(consumeSpy.calledOnce).to.be.true()
      expect(produceSpy.calledOnce).to.be.false()

      expect(fastifyMock.register.calledTwice).to.be.true()
      expect(fastifyMock.register.firstCall.calledWith(cors)).to.be.true()
      expect(fastifyMock.register.secondCall.calledWith(helmet)).to.be.true()

      expect(fastifyMock.get.calledOnce).to.be.true()
      expect(fastifyMock.get.firstCall.calledWith('/test/ping', healthHandler)).to.be.true()

      expect(fastifyMock.all.calledOnce).to.be.true()
      expect(fastifyMock.all.firstCall.calledWith('/test/actor', mainHandler)).to.be.true()
    })
  })

  describe('PROCESSOR_TYPE: "stream processor"', () => {
    before(async () => {
      const index = proxyquire('../src', proxyConfig)

      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      onErrorHook = index.onErrorHook
      onRequestHook = index.onRequestHook
      onResponseHook = index.onResponseHook

      await index.default(fastifyMock)
    })

    it('should initialize "stream processor" processor type correctly', () => {
      expect(fastifyMock.addHook.calledThrice).to.be.true()
      expect(fastifyMock.addHook.firstCall.calledWith('onRequest', onRequestHook)).to.be.true()
      expect(fastifyMock.addHook.secondCall.calledWith('onError', onErrorHook)).to.be.true()
      expect(fastifyMock.addHook.thirdCall.calledWith('onResponse', onResponseHook)).to.be.true()

      expect(consumeSpy.calledOnce).to.be.true()
      expect(produceSpy.calledOnce).to.be.true()

      expect(fastifyMock.register.calledTwice).to.be.true()
      expect(fastifyMock.register.firstCall.calledWith(cors)).to.be.true()
      expect(fastifyMock.register.secondCall.calledWith(helmet)).to.be.true()

      expect(fastifyMock.get.calledOnce).to.be.true()
      expect(fastifyMock.get.firstCall.calledWith('/test/ping', healthHandler)).to.be.true()

      expect(fastifyMock.all.calledOnce).to.be.true()
      expect(fastifyMock.all.firstCall.calledWith('/test/actor', mainHandler)).to.be.true()
    })
  })
})

describe('handlers', () => {
  let consumeHandler, healthHandler, mainHandler

  afterEach(() => {
    consumeSpy.resetHistory()
    produceSpy.resetHistory()
    storeRecordSpy.resetHistory()

    repoRecordSpy.resetHistory()
    updateSpy.resetHistory()
    getStub.resetHistory()

    performStub.resetHistory()
    replayStub.resetHistory()

    withStub.resetHistory()
    extractSpy.resetHistory()

    startSpanStub.resetHistory()
    injectSpy.resetHistory()
    addEventSpy.resetHistory()
    endSpy.resetHistory()
  })

  describe('(consumer variation)', () => {
    beforeEach(async () => {
      const index = proxyquire('../src', {
        ...proxyConfig,
        './config': {
          ...proxyConfig['./config'],
          PROCESSOR_TYPE: 'consumer'
        }
      })

      consumeHandler = index.consumeHandler
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      await index.default(fastifyMock)
    })

    describe('#consumeHandler', () => {
      it('should handle messages without a cache successfully', async () => {
        const data = {
          message: {
            value: '{ "id": "unknown" }',
            headers: {
              traceparent: 'test'
            }
          }
        }
        await consumeHandler(data)

        expect(storeRecordSpy.called).to.be.false()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.calledOnce).to.be.true()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle messages with a cache successfully', async () => {
        const data = {
          message: {
            value: '{ "id": "test" }',
            headers: {
              traceparent: 'test'
            }
          }
        }
        await consumeHandler(data)

        expect(storeRecordSpy.called).to.be.false()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.calledOnce).to.be.true()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })

      it('should consume messages without trace headers successfully', async () => {
        const testMessage = {
          message: {
            value: '{ "id": "test" }',
            headers: {}
          }
        }
        await consumeHandler(testMessage)

        expect(storeRecordSpy.called).to.be.false()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.calledOnce).to.be.true()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })
    })
  })

  describe('(stream processor variation)', () => {
    beforeEach(async () => {
      const index = proxyquire('../src', proxyConfig)

      consumeHandler = index.consumeHandler
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      await index.default(fastifyMock)
    })

    describe('#consumeHandler', () => {
      it('should handle messages without a cache successfully', async () => {
        const data = {
          message: {
            value: '{ "id": "unknown" }',
            headers: {
              traceparent: 'test'
            }
          }
        }
        await consumeHandler(data)

        expect(storeRecordSpy.calledOnce).to.be.true()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle messages with a cache successfully', async () => {
        const data = {
          message: {
            value: '{ "id": "test" }',
            headers: {
              traceparent: 'test'
            }
          }
        }
        await consumeHandler(data)

        expect(storeRecordSpy.calledOnce).to.be.true()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })

      it('should consume messages without trace headers successfully', async () => {
        const testMessage = {
          message: {
            value: '{ "id": "test" }',
            headers: {}
          }
        }
        await consumeHandler(testMessage)

        expect(storeRecordSpy.calledOnce).to.be.true()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()

        expect(withStub.calledOnce).to.be.true()
        expect(extractSpy.calledOnce).to.be.true()
        expect(startSpanStub.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })
    })

    describe('#healthHandler', () => {
      it('should respond with `OK` successfully', () => {
        expect(healthHandler()).to.equal('OK')
      })
    })

    describe('#mainHandler', () => {
      it('should handle requests without a body successfully', async () => {
        const request = { params: { id: 'unknown' } }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

        expect(startSpanStub.calledOnce).to.be.true()
        expect(injectSpy.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(addEventSpy.calledTwice).to.be.true()
        expect(addEventSpy.firstCall.calledWith('actor.perform start')).to.be.true()
        expect(addEventSpy.secondCall.calledWith('actor.perform end')).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle requests with only a body type successfully', async () => {
        const request = { body: { type: 'Test' }, params: { id: 'test' } }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

        expect(startSpanStub.calledOnce).to.be.true()
        expect(injectSpy.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(addEventSpy.callCount).to.equal(4)
        expect(addEventSpy.firstCall.calledWith('processing FSA start')).to.be.true()
        expect(addEventSpy.secondCall.calledWith('processing FSA end')).to.be.true()
        expect(addEventSpy.thirdCall.calledWith('actor.perform start')).to.be.true()
        expect(addEventSpy.lastCall.calledWith('actor.perform end')).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })

      it('should handle requests with short-circuit body successfully', async () => {
        const request = { body: { test: 'short-circuit' }, params: { id: 'test' } }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

        expect(startSpanStub.calledOnce).to.be.true()
        expect(injectSpy.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(addEventSpy.callCount).to.equal(4)
        expect(addEventSpy.firstCall.calledWith('processing JSON start')).to.be.true()
        expect(addEventSpy.secondCall.calledWith('processing JSON end')).to.be.true()
        expect(addEventSpy.thirdCall.calledWith('actor.perform start')).to.be.true()
        expect(addEventSpy.lastCall.calledWith('actor.perform end')).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })

      it('should handle requests with serialized model with data successfully', async () => {
        const request = {
          body: {
            type: 'Test',
            payload: { test: 'serialized model' },
            meta: { some: 'metadata' }
          },
          params: { id: 'test' }
        }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

        expect(startSpanStub.calledOnce).to.be.true()
        expect(injectSpy.calledOnce).to.be.true()
        expect(endSpy.calledOnce).to.be.true()

        expect(addEventSpy.callCount).to.equal(4)
        expect(addEventSpy.firstCall.calledWith('processing FSA start')).to.be.true()
        expect(addEventSpy.secondCall.calledWith('processing FSA end')).to.be.true()
        expect(addEventSpy.thirdCall.calledWith('actor.perform start')).to.be.true()
        expect(addEventSpy.lastCall.calledWith('actor.perform end')).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })
    })
  })
})

describe('hooks', () => {
  describe('#onRequestHook', () => {
    let onRequestHook

    afterEach(() => {
      startSpanStub.resetHistory()
      bindSpy.resetHistory()
      withStub.resetHistory()
      extractSpy.resetHistory()
      setAttributeSpy.resetHistory()
      withSpanStub.resetHistory()
      doneSpy.resetHistory()
    })

    before(async () => {
      const index = proxyquire('../src', proxyConfig)

      onRequestHook = index.onRequestHook

      await index.default(fastifyMock)
    })

    it('should be done immediately if url is PING_URL', () => {
      onRequestHook({ ...requestMock, url: '/test/ping' }, replyMock, doneSpy)

      expect(getCurrentSpanStub.called).to.be.false()
      expect(startSpanStub.called).to.be.false()
      expect(withStub.called).to.be.false()
      expect(extractSpy.called).to.be.false()
      expect(setAttributeSpy.called).to.be.false()
      expect(withSpanStub.called).to.be.false()
      expect(bindSpy.called).to.be.false()

      expect(doneSpy.calledOnce).to.be.true()
    })

    it('should create the "hive service request" span with a parent', () => {
      onRequestHook(requestMock, replyMock, doneSpy)

      expect(getCurrentSpanStub.calledOnce).to.be.true()

      expect(startSpanStub.calledOnce).to.be.true()
      expect(startSpanStub.calledWith('hive^io - HTTP/2 - GET')).to.be.true()

      expect(withStub.called).to.be.false()
      expect(extractSpy.called).to.be.false()
      expect(setAttributeSpy.called).to.be.false()
      expect(withSpanStub.called).to.be.false()
      expect(bindSpy.called).to.be.false()

      expect(doneSpy.calledOnce).to.be.true()
    })

    it('should create the "hive service request" span with new context', () => {
      onRequestHook(requestMock, replyMock, doneSpy)

      expect(getCurrentSpanStub.calledTwice).to.be.true()

      expect(startSpanStub.calledOnce).to.be.true()
      expect(startSpanStub.calledWith('hive^io - HTTP/2 - GET', {
        kind: 1,
        attributes: {
          [HttpAttribute.HTTP_URL]: requestMock.url,
          [HttpAttribute.HTTP_METHOD]: requestMock.method,
          [HttpAttribute.HTTP_ROUTE]: requestMock.routerPath,
          [HttpAttribute.HTTP_STATUS_CODE]: 200
        }
      })).to.be.true()

      expect(withStub.calledOnce).to.be.true()

      expect(extractSpy.calledOnce).to.be.true()
      expect(extractSpy.calledWith(requestMock.raw.headers)).to.be.true()

      expect(setAttributeSpy.called).to.be.false()

      expect(withSpanStub.calledOnce).to.be.true()

      expect(bindSpy.calledTwice).to.be.true()
      expect(bindSpy.firstCall.calledWith(requestMock.raw)).to.be.true()
      expect(bindSpy.secondCall.calledWith(replyMock.raw)).to.be.true()

      expect(doneSpy.calledOnce).to.be.true()
    })

    it('should create the "hive service request" span with new context with "user-agent" data', () => {
      onRequestHook({ ...requestMock, headers: { 'user-agent': 'test' } }, replyMock, doneSpy)

      expect(getCurrentSpanStub.calledThrice).to.be.true()

      expect(startSpanStub.calledOnce).to.be.true()
      expect(startSpanStub.calledWith('hive^io - HTTP/2 - GET', {
        kind: 1,
        attributes: {
          [HttpAttribute.HTTP_URL]: requestMock.url,
          [HttpAttribute.HTTP_METHOD]: requestMock.method,
          [HttpAttribute.HTTP_ROUTE]: requestMock.routerPath,
          [HttpAttribute.HTTP_STATUS_CODE]: 200
        }
      })).to.be.true()

      expect(withStub.calledOnce).to.be.true()

      expect(extractSpy.calledOnce).to.be.true()
      expect(extractSpy.calledWith(requestMock.raw.headers)).to.be.true()

      expect(setAttributeSpy.calledOnce).to.be.true()
      expect(setAttributeSpy.calledWith(HttpAttribute.HTTP_USER_AGENT, 'test'))

      expect(withSpanStub.calledOnce).to.be.true()

      expect(bindSpy.calledTwice).to.be.true()
      expect(bindSpy.firstCall.calledWith(requestMock.raw)).to.be.true()
      expect(bindSpy.secondCall.calledWith(replyMock.raw)).to.be.true()

      expect(doneSpy.calledOnce).to.be.true()
    })
  })

  describe('#onErrorHook', () => {
    let onRequestHook, onErrorHook

    afterEach(() => {
      setAttributesSpy.resetHistory()
      setStatusSpy.resetHistory()
      doneSpy.resetHistory()
    })

    before(async () => {
      const index = proxyquire('../src', proxyConfig)

      onRequestHook = index.onRequestHook
      onErrorHook = index.onErrorHook

      await index.default(fastifyMock)
    })

    it('should immediately return if the span doesn\'t exist', () => {
      onErrorHook(requestMock, replyMock, {}, doneSpy)

      expect(setAttributesSpy.called).to.be.false()
      expect(setStatusSpy.called).to.be.false()
      expect(doneSpy.calledOnce).to.be.true()
    })

    it('should set HttpAttribute.HTTP_STATUS_CODE to 400 by default', () => {
      onRequestHook(requestMock, replyMock, doneSpy)
      onErrorHook(requestMock, replyMock, errorMock, doneSpy)

      expect(setAttributesSpy.calledOnce).to.be.true()
      expect(setAttributesSpy.calledWith({
        [HttpAttribute.HTTP_STATUS_CODE]: 400,
        'error.name': errorMock.name,
        'error.message': errorMock.message,
        'error.stack': errorMock.stack
      })).to.be.true()

      expect(setStatusSpy.calledOnce).to.be.true()
      expect(setStatusSpy.calledWith({ code: StatusCode.ERROR }))

      expect(doneSpy.calledTwice).to.be.true()
    })

    it('should set HttpAttribute.HTTP_STATUS_CODE to statusCode defined in reply', () => {
      onRequestHook(requestMock, replyMock, doneSpy)
      onErrorHook(requestMock, { ...replyMock, statusCode: 404 }, errorMock, doneSpy)

      expect(setAttributesSpy.calledOnce).to.be.true()
      expect(setAttributesSpy.calledWith({
        [HttpAttribute.HTTP_STATUS_CODE]: 404,
        'error.name': errorMock.name,
        'error.message': errorMock.message,
        'error.stack': errorMock.stack
      })).to.be.true()

      expect(setStatusSpy.calledOnce).to.be.true()
      expect(setStatusSpy.calledWith({ code: StatusCode.ERROR }))

      expect(doneSpy.calledTwice).to.be.true()
    })

    it('should set HttpAttribute.HTTP_STATUS_CODE to statusCode defined in error', () => {
      onRequestHook(requestMock, replyMock, doneSpy)
      onErrorHook(requestMock, replyMock, { ...errorMock, statusCode: 401 }, doneSpy)

      expect(setAttributesSpy.calledOnce).to.be.true()
      expect(setAttributesSpy.calledWith({
        [HttpAttribute.HTTP_STATUS_CODE]: 401,
        'error.name': errorMock.name,
        'error.message': errorMock.message,
        'error.stack': errorMock.stack
      })).to.be.true()

      expect(setStatusSpy.calledOnce).to.be.true()
      expect(setStatusSpy.calledWith({ code: StatusCode.ERROR }))

      expect(doneSpy.calledTwice).to.be.true()
    })
  })

  describe('#onResponseHook', () => {
    let onRequestHook, onResponseHook

    afterEach(() => {
      endSpy.resetHistory()
      doneSpy.resetHistory()
    })

    before(async () => {
      const index = proxyquire('../src', proxyConfig)

      onRequestHook = index.onRequestHook
      onResponseHook = index.onResponseHook

      await index.default(fastifyMock)
    })

    it('should immediately return if the span doesn\'t exist', () => {
      onResponseHook(requestMock, null, doneSpy)

      expect(endSpy.called).to.be.false()
      expect(doneSpy.calledOnce).to.be.true()
    })

    it('should end the span on response', () => {
      onRequestHook(requestMock, replyMock, doneSpy)
      onResponseHook(requestMock, null, doneSpy)

      expect(endSpy.calledOnce).to.be.true()
      expect(doneSpy.calledTwice).to.be.true()
    })
  })
})

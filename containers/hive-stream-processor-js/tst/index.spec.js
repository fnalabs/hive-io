/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'

import cors from 'fastify-cors'
import helmet from 'fastify-helmet'

chai.use(chaiHttp)
chai.use(dirtyChai)

// mocks
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

const fastifyMock = {
  all: spy(),
  get: spy(),
  register: spy()
}

// tests
describe('main', () => {
  let main, healthHandler, mainHandler

  afterEach(() => {
    consumeSpy.resetHistory()
    produceSpy.resetHistory()

    fastifyMock.all.resetHistory()
    fastifyMock.get.resetHistory()
    fastifyMock.register.resetHistory()
  })

  describe('PROCESSOR_TYPE: "producer"', () => {
    before(() => {
      const index = proxyquire('../src', {
        './config': {
          PROCESSOR_TYPE: 'producer',
          PING_URL: '/test/ping',
          ACTOR: 'PostActor',
          ACTOR_LIB: 'codecov',
          ACTOR_URLS: ['/test/actor']
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
        codecov: {
          PostActor: class Actor {
            async perform () { return performStub() }
            async replay () { return replayStub() }
          }
        }
      })

      main = index.default
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      main(fastifyMock)
    })

    it('should initialize "producer" processor type correctly', () => {
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
    before(() => {
      const index = proxyquire('../src', {
        './config': {
          PROCESSOR_TYPE: 'consumer',
          PING_URL: '/test/ping',
          ACTOR: 'PostActor',
          ACTOR_LIB: 'codecov',
          ACTOR_URLS: ['/test/actor']
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
        codecov: {
          PostActor: class Actor {
            async perform () { return performStub() }
            async replay () { return replayStub() }
          }
        }
      })

      main = index.default
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      main(fastifyMock)
    })

    it('should initialize "consumer" processor type correctly', () => {
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
    before(() => {
      const index = proxyquire('../src', {
        './config': {
          PROCESSOR_TYPE: 'stream_processor',
          PING_URL: '/test/ping',
          ACTOR: 'PostActor',
          ACTOR_LIB: 'codecov',
          ACTOR_URLS: ['/test/actor']
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
        codecov: {
          PostActor: class Actor {
            async perform () { return performStub() }
            async replay () { return replayStub() }
          }
        }
      })

      main = index.default
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      main(fastifyMock)
    })

    it('should initialize "stream processor" processor type correctly', () => {
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
  let main, consumeHandler, healthHandler, mainHandler

  afterEach(() => {
    consumeSpy.resetHistory()
    produceSpy.resetHistory()
    storeRecordSpy.resetHistory()

    repoRecordSpy.resetHistory()
    updateSpy.resetHistory()
    getStub.resetHistory()

    performStub.resetHistory()
    replayStub.resetHistory()

    fastifyMock.all.resetHistory()
    fastifyMock.get.resetHistory()
    fastifyMock.register.resetHistory()
  })

  describe('(consumer variation)', () => {
    beforeEach(() => {
      const index = proxyquire('../src', {
        './config': {
          PROCESSOR_TYPE: 'consumer',
          PING_URL: '/test/ping',
          ACTOR: 'PostActor',
          ACTOR_LIB: 'codecov',
          ACTOR_URLS: ['/test/actor']
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
        codecov: {
          PostActor: class Actor {
            async perform () { return performStub() }
            async replay () { return replayStub() }
          }
        }
      })

      main = index.default
      consumeHandler = index.consumeHandler
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      main(fastifyMock)
    })

    describe('#consumeHandler', () => {
      it('should handle messages without a cache successfully', async () => {
        const data = { message: { value: '{ "id": "unknown" }' } }
        await consumeHandler(data)

        expect(storeRecordSpy.called).to.be.false()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle messages with a cache successfully', async () => {
        const data = { message: { value: '{ "id": "test" }' } }
        await consumeHandler(data)

        expect(storeRecordSpy.called).to.be.false()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })
    })
  })

  describe('(stream processor variation)', () => {
    beforeEach(() => {
      const index = proxyquire('../src', {
        './config': {
          PROCESSOR_TYPE: 'stream_processor',
          PING_URL: '/test/ping',
          ACTOR: 'PostActor',
          ACTOR_LIB: 'codecov',
          ACTOR_URLS: ['/test/actor']
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
        codecov: {
          PostActor: class Actor {
            async perform () { return performStub() }
            async replay () { return replayStub() }
          }
        }
      })

      main = index.default
      consumeHandler = index.consumeHandler
      healthHandler = index.healthHandler
      mainHandler = index.mainHandler

      main(fastifyMock)
    })

    describe('#consumeHandler', () => {
      it('should handle messages without a cache successfully', async () => {
        const data = { message: { value: '{ "id": "unknown" }' } }
        await consumeHandler(data)

        expect(storeRecordSpy.calledOnce).to.be.true()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle messages with a cache successfully', async () => {
        const data = { message: { value: '{ "id": "test" }' } }
        await consumeHandler(data)

        expect(storeRecordSpy.calledOnce).to.be.true()

        expect(getStub.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()

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

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
      })

      it('should handle requests with only a body type successfully', async () => {
        const request = { body: { type: 'Test' }, params: { id: 'test' } }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })

      it('should handle requests with short-circuit body successfully', async () => {
        const request = { body: { test: 'short-circuit' }, params: { id: 'test' } }
        const result = await mainHandler(request)

        expect(result).to.equal('test')

        expect(getStub.calledOnce).to.be.true()
        expect(repoRecordSpy.calledOnce).to.be.true()

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

        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
      })
    })
  })
})

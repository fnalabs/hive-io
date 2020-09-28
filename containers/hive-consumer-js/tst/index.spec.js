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
const performStub = stub().resolves({ model: 'test' })
const { default: main, consumeHandler, healthHandler, mainHandler } = proxyquire('../src', {
  './config': {
    PING_URL: '/test/ping',
    ACTOR: 'PostActor',
    ACTOR_LIB: 'codecov',
    ACTOR_URLS: ['/test/actor']
  },
  './store': class EventStore {
    consume () { consumeSpy() }
  },
  codecov: {
    PostActor: class Actor {
      async perform () { return performStub() }
    }
  }
})

const fastifyMock = {
  all: spy(),
  get: spy(),
  register: spy()
}

// tests
describe('main', () => {
  before(async () => {
    await main(fastifyMock)
  })

  it('should initialize the app successfully', () => {
    expect(consumeSpy.calledOnce).to.be.true()

    expect(fastifyMock.register.calledTwice).to.be.true()
    expect(fastifyMock.register.firstCall.calledWith(cors)).to.be.true()
    expect(fastifyMock.register.secondCall.calledWith(helmet)).to.be.true()

    expect(fastifyMock.get.calledOnce).to.be.true()
    expect(fastifyMock.get.firstCall.calledWith('/test/ping', healthHandler)).to.be.true()

    expect(fastifyMock.all.calledOnce).to.be.true()
    expect(fastifyMock.all.firstCall.calledWith('/test/actor', mainHandler)).to.be.true()
  })
})

describe('handlers', () => {
  describe('#consumeHandler', () => {
    afterEach(() => performStub.resetHistory())

    it('should consume messages successfully', async () => {
      const testMessage = { message: { value: '{}' } }
      await consumeHandler(testMessage)

      expect(performStub.calledOnce).to.be.true()
    })
  })

  describe('#healthHandler', () => {
    it('should respond with `OK` successfully', () => {
      expect(healthHandler()).to.equal('OK')
    })
  })

  describe('#mainHandler', () => {
    afterEach(() => performStub.resetHistory())

    it('should handle requests without a body successfully', async () => {
      const request = {}

      await expect(mainHandler(request)).to.eventually.be('test')

      expect(performStub.calledOnce).to.be.true()
    })

    it('should handle requests with only a body type successfully', async () => {
      const request = { body: { type: 'Test' } }

      await expect(mainHandler(request)).to.eventually.be('test')

      expect(performStub.calledOnce).to.be.true()
    })

    it('should handle requests with short-circuit body successfully', async () => {
      const request = { body: { test: 'short-circuit' } }

      await expect(mainHandler(request)).to.eventually.be('test')

      expect(performStub.calledOnce).to.be.true()
    })

    it('should handle requests with serialized model with data successfully', async () => {
      const request = {
        body: {
          type: 'Test',
          payload: { test: 'serialized model' },
          meta: { some: 'metadata' }
        }
      }

      await expect(mainHandler(request)).to.eventually.be('test')

      expect(performStub.calledOnce).to.be.true()
    })
  })
})

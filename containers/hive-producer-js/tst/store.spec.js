/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('store', () => {
  let Store, store, consoleStub, disconnectSpy, processStub

  after(() => {
    consoleStub.restore()
    disconnectSpy = null
    processStub.restore()
  })

  before(() => {
    consoleStub = sinon.stub(console, 'error')
    disconnectSpy = sinon.spy()
    processStub = sinon.stub(process, 'once').value((_type, cb) => cb())
  })

  describe('#constructor', () => {
    let constructorSpy, connectSpy, producerStub

    after(() => {
      Store = null
      store = null

      constructorSpy = null
      connectSpy = null
      producerStub = null
    })

    before(() => {
      constructorSpy = sinon.spy()
      connectSpy = sinon.spy()
      producerStub = sinon.stub().returns({
        connect () { connectSpy() },
        disconnect () { disconnectSpy() }
      })

      Store = proxyquire('../src/store', {
        './config': {
          EVENT_STORE_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            constructor (config) { constructorSpy(config) }
            producer () { return producerStub() }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = new Store()
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(store.produce).to.be.a('function')
      expect(store.record).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(connectSpy.called).to.be.false()
      expect(producerStub.calledOnce).to.be.true()

      expect(disconnectSpy.callCount).to.equal(5)
    })
  })

  describe('#produce', () => {
    let connectSpy

    after(() => {
      Store = null
      store = null

      connectSpy = null
    })

    before(async () => {
      connectSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        './config': {
          EVENT_STORE_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            producer () {
              return {
                connect () { connectSpy() },
                disconnect () {}
              }
            }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = new Store()
      await store.produce()
    })

    it('should call connect once successfully', () => {
      expect(connectSpy.calledOnce).to.be.true()
    })
  })

  describe('#record', () => {
    let clearTimeoutStub, sendStub, setTimeoutStub, toJsonStub
    const sendStubs = [
      sinon.stub(),
      sinon.stub().throws(Error)
    ]

    afterEach(() => {
      Store = null
      store = null

      clearTimeoutStub.restore()
      sendStub = null
      setTimeoutStub.restore()
      toJsonStub = null
    })

    beforeEach(() => {
      clearTimeoutStub = sinon.stub(global, 'clearTimeout')
      sendStub = sendStubs.shift()
      setTimeoutStub = sinon.stub(global, 'setTimeout').returns(1)
      toJsonStub = sinon.stub().returns({})

      Store = proxyquire('../src/store', {
        './config': {
          EVENT_STORE_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            producer () {
              return {
                disconnect () {},
                send () { sendStub() }
              }
            }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = new Store()
    })

    it('should handle normal event record posts', async () => {
      await expect(store.record({ key: 'id' }, { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(clearTimeoutStub.called).to.be.false()
      expect(sendStub.called).to.be.false()
      expect(setTimeoutStub.calledOnce).to.be.true()
      expect(toJsonStub.calledOnce).to.be.true()

      await expect(store.record(undefined, { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(clearTimeoutStub.calledOnce).to.be.true()
      expect(sendStub.calledOnce).to.be.true()
      expect(setTimeoutStub.calledOnce).to.be.true()
      expect(toJsonStub.calledTwice).to.be.true()
    })

    it('should handle errors on commit', async () => {
      await expect(store.record({ key: 'id' }, { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(clearTimeoutStub.called).to.be.false()
      expect(sendStub.called).to.be.false()
      expect(setTimeoutStub.calledOnce).to.be.true()
      expect(toJsonStub.calledOnce).to.be.true()

      await expect(store.record(undefined, { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(clearTimeoutStub.calledOnce).to.be.true()
      expect(sendStub.calledOnce).to.be.true()
      expect(setTimeoutStub.calledOnce).to.be.true()
      expect(toJsonStub.calledTwice).to.be.true()
    })
  })
})

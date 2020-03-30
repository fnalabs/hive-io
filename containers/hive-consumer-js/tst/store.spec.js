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
    let constructorSpy, consumerStub

    after(() => {
      Store = null
      store = null

      constructorSpy = null
      consumerStub = null
    })

    before(() => {
      constructorSpy = sinon.spy()
      consumerStub = sinon.stub().returns({ disconnect () { disconnectSpy() } })

      Store = proxyquire('../src/store', {
        './config': {
          EVENT_STORE_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_GROUP_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_FROM_START: false,
          EVENT_STORE_PARTITIONS: 1,
          EVENT_STORE_BUFFER: null,
          EVENT_STORE_TIMEOUT: null
        },
        kafkajs: {
          Kafka: class Kafka {
            constructor () { constructorSpy() }
            consumer () { return consumerStub() }
          }
        }
      })
      store = new Store()
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(store.consume).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(consumerStub.calledOnce).to.be.true()

      expect(disconnectSpy.callCount).to.equal(5)
    })
  })

  describe('#consume', () => {
    let connectSpy, subscribeSpy, runSpy

    after(() => {
      Store = null
      store = null

      connectSpy = null
      subscribeSpy = null
      runSpy = null
    })

    before(() => {
      connectSpy = sinon.spy()
      subscribeSpy = sinon.spy()
      runSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        './config': {
          EVENT_STORE_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_GROUP_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_FROM_START: false,
          EVENT_STORE_PARTITIONS: 1,
          EVENT_STORE_BUFFER: null,
          EVENT_STORE_TIMEOUT: null
        },
        kafkajs: {
          Kafka: class Kafka {
            consumer () {
              return {
                connect () { connectSpy() },
                subscribe () { subscribeSpy() },
                run () { runSpy() }
              }
            }
          }
        }
      })
      store = new Store()
    })

    it('should start consuming events successfully', async () => {
      await expect(store.consume()).to.eventually.be.fulfilled()
      expect(connectSpy.calledOnce).to.be.true()
      expect(subscribeSpy.calledOnce).to.be.true()
      expect(runSpy.calledOnce).to.be.true()
    })
  })
})

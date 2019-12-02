/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('store', () => {
  let Store, store

  describe('#constructor', () => {
    let constructorSpy, consoleStub, consumerStub, disconnectSpy, processStub, producerStub

    afterEach(() => {
      Store = null
      store = null

      constructorSpy = null
      consumerStub = null
      producerStub = null

      consoleStub.restore()
      disconnectSpy = null
      processStub.restore()
    })

    beforeEach(() => {
      consoleStub = sinon.stub(console, 'error')
      disconnectSpy = sinon.spy()
      processStub = sinon.stub(process, 'once').value((_type, cb) => cb())

      constructorSpy = sinon.spy()
      consumerStub = sinon.stub().returns({ disconnect () { disconnectSpy() } })
      producerStub = sinon.stub().returns({ disconnect () { disconnectSpy() } })
    })

    it('should create the Store object with the default processor type', async () => {
      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'producer',
          EVENT_STORE_PRODUCER_TOPIC: '',
          EVENT_STORE_ID: '',
          EVENT_STORE_GROUP_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_FROM_START: false,
          EVENT_STORE_PARTITIONS: 1,
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            constructor (config) { constructorSpy(config) }
            consumer () { return consumerStub() }
            producer () { return producerStub() }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = await new Store()

      expect(store).to.exist()

      expect(store.consume).to.be.a('function')
      expect(store.produce).to.be.a('function')
      expect(store.record).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(consumerStub.called).to.be.false()
      expect(producerStub.calledOnce).to.be.true()

      expect(disconnectSpy.callCount).to.equal(5)
    })

    it('should create the Store object with the consumer processor type', async () => {
      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'consumer',
          EVENT_STORE_CONSUMER_TOPIC: 'test',
          EVENT_STORE_ID: '',
          EVENT_STORE_GROUP_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_FROM_START: false,
          EVENT_STORE_PARTITIONS: 1,
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            constructor (config) { constructorSpy(config) }
            consumer () { return consumerStub() }
            producer () { return producerStub() }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = await new Store()

      expect(store).to.exist()

      expect(store.consume).to.be.a('function')
      expect(store.produce).to.be.a('function')
      expect(store.record).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(consumerStub.calledOnce).to.be.true()
      expect(producerStub.called).to.be.false()

      expect(disconnectSpy.callCount).to.equal(5)
    })

    it('should create the Store object with the stream_processor processor type', async () => {
      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'stream_processor',
          EVENT_STORE_PRODUCER_TOPIC: '',
          EVENT_STORE_CONSUMER_TOPIC: 'test',
          EVENT_STORE_ID: '',
          EVENT_STORE_GROUP_ID: '',
          EVENT_STORE_BROKERS: '',
          EVENT_STORE_FROM_START: false,
          EVENT_STORE_PARTITIONS: 1,
          EVENT_STORE_BUFFER: 2,
          EVENT_STORE_TIMEOUT: 100
        },
        kafkajs: {
          Kafka: class Kafka {
            constructor (config) { constructorSpy(config) }
            consumer () { return consumerStub() }
            producer () { return producerStub() }
          },
          CompressionTypes: {
            GZIP: true
          }
        }
      })
      store = await new Store()

      expect(store).to.exist()

      expect(store.consume).to.be.a('function')
      expect(store.produce).to.be.a('function')
      expect(store.record).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(consumerStub.calledOnce).to.be.true()
      expect(producerStub.calledOnce).to.be.true()

      expect(disconnectSpy.callCount).to.equal(10)
    })
  })

  describe('#consume', () => {
    let connectSpy, consoleStub, processStub, subscribeSpy, runSpy

    after(() => {
      Store = null
      store = null

      connectSpy = null
      consoleStub.restore()
      processStub.restore()
      subscribeSpy = null
      runSpy = null
    })

    before(() => {
      connectSpy = sinon.spy()
      consoleStub = sinon.stub(console, 'error')
      processStub = sinon.stub(process, 'once')
      subscribeSpy = sinon.spy()
      runSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'consumer',
          EVENT_STORE_CONSUMER_TOPIC: 'test',
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
                disconnect () {},
                subscribe () { subscribeSpy() },
                run () { runSpy() }
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

    it('should start consuming events successfully', async () => {
      await expect(store.consume()).to.eventually.be.fulfilled()
      expect(connectSpy.calledOnce).to.be.true()
      expect(subscribeSpy.calledOnce).to.be.true()
      expect(runSpy.calledOnce).to.be.true()
    })
  })

  describe('#produce', () => {
    let connectSpy, consoleStub, processStub

    after(() => {
      Store = null
      store = null

      connectSpy = null
      consoleStub.restore()
      processStub.restore()
    })

    before(async () => {
      connectSpy = sinon.spy()
      consoleStub = sinon.stub(console, 'error')
      processStub = sinon.stub(process, 'once')

      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'producer',
          EVENT_STORE__PRODUCER_TOPIC: '',
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
    let clearTimeoutStub, consoleStub, processStub, sendStub, setTimeoutStub, toJsonStub
    const sendStubs = [
      sinon.stub(),
      sinon.stub().throws(Error)
    ]

    afterEach(() => {
      Store = null
      store = null

      clearTimeoutStub.restore()
      consoleStub.restore()
      processStub.restore()
      sendStub = null
      setTimeoutStub.restore()
      toJsonStub = null
    })

    beforeEach(() => {
      clearTimeoutStub = sinon.stub(global, 'clearTimeout')
      consoleStub = sinon.stub(console, 'error')
      processStub = sinon.stub(process, 'once')
      sendStub = sendStubs.shift()
      setTimeoutStub = sinon.stub(global, 'setTimeout').returns(1)
      toJsonStub = sinon.stub().returns({})

      Store = proxyquire('../src/store', {
        '../conf/appConfig': {
          PROCESSOR_TYPE: 'producer',
          EVENT_STORE_PRODUCER_TOPIC: '',
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

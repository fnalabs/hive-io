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
    const sandbox = sinon.createSandbox()

    let clientSpy, consumerSpy, producerSpy, refreshSpy

    afterEach(() => {
      Store = null
      store = null

      clientSpy = null
      consumerSpy = null
      producerSpy = null
      refreshSpy = null

      sandbox.restore()
    })

    beforeEach(() => {
      clientSpy = sinon.spy()
      consumerSpy = sinon.spy()
      producerSpy = sinon.spy()
      refreshSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        'kafka-node': {
          Client: class Client {
            constructor () { clientSpy() }
            refreshMetadata () { refreshSpy() }
          },
          ConsumerGroup: class HighLevelProducer {
            constructor () { consumerSpy() }
          },
          HighLevelProducer: class HighLevelProducer {
            constructor () { producerSpy() }
          }
        }
      })

      sandbox.spy(process, 'on')
      sandbox.spy(process, 'removeAllListeners')
    })

    it('should create the Store object with the default processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'producer',
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.null()
      expect(store.log).to.be.a('function')

      expect(clientSpy.calledOnce).to.be.true()
      expect(consumerSpy.called).to.be.false()
      expect(producerSpy.calledOnce).to.be.true()
      expect(refreshSpy.calledOnce).to.be.true()
    })

    it('should create the Store object with the consumer processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'consumer',
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.an('object')

      expect(clientSpy.calledOnce).to.be.true()
      expect(consumerSpy.calledOnce).to.be.true()
      expect(producerSpy.called).to.be.false()
      expect(refreshSpy.calledOnce).to.be.true()
    })

    it('should create the Store object with the stream_processor processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'stream_processor',
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.an('object')

      expect(clientSpy.calledOnce).to.be.true()
      expect(consumerSpy.calledOnce).to.be.true()
      expect(producerSpy.calledOnce).to.be.true()
      expect(refreshSpy.calledOnce).to.be.true()
    })
  })

  describe('#log', () => {
    const sandbox = sinon.createSandbox()

    let sendStub, toJsonStub
    const sendStubs = [
      (data, fn) => fn(false, {}),
      (data, fn) => fn(true, {})
    ]

    afterEach(() => {
      Store = null
      store = null

      sendStub = null

      sandbox.restore()
    })

    beforeEach(() => {
      sendStub = sendStubs.shift()
      toJsonStub = sinon.stub().returns({meta: {}})

      Store = proxyquire('../src/store', {
        'kafka-node': {
          Client: class Client {
            refreshMetadata () {}
          },
          ConsumerGroup: class HighLevelProducer {},
          HighLevelProducer: class HighLevelProducer {
            send (data, cb) { sendStub(data, cb) }
          }
        }
      })
      store = new Store({
        AGGREGATE_LIST: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      sandbox.spy(process, 'on')
      sandbox.spy(process, 'removeAllListeners')
    })

    it('should handle normal log posts', async () => {
      await expect(store.log('id', { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(toJsonStub.calledOnce).to.be.true()
    })

    it('should be rejected', async () => {
      await expect(store.log('id', { toJSON () { return toJsonStub() } })).to.eventually.be.rejected()
      expect(toJsonStub.calledOnce).to.be.true()
    })
  })
})

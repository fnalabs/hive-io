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
    let consumerSpy, consumerConnectSpy, consumerOnSpy, consumerSubscribeSpy, consumerConsumeSpy
    let producerSpy, producerConnectSpy, producerOnSpy, producerSetPollIntervalSpy

    afterEach(() => {
      Store = null
      store = null

      consumerSpy = null
      consumerConnectSpy = null
      consumerOnSpy = null
      consumerSubscribeSpy = null
      consumerConsumeSpy = null

      producerSpy = null
      producerConnectSpy = null
      producerOnSpy = null
      producerSetPollIntervalSpy = null
    })

    beforeEach(() => {
      consumerSpy = sinon.spy()
      consumerConnectSpy = sinon.spy()
      consumerOnSpy = sinon.spy()
      consumerSubscribeSpy = sinon.spy()
      consumerConsumeSpy = sinon.spy()

      producerSpy = sinon.spy()
      producerConnectSpy = sinon.spy()
      producerOnSpy = sinon.spy()
      producerSetPollIntervalSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        'node-rdkafka': {
          KafkaConsumer: class KafkaConsumer {
            constructor () { consumerSpy() }
            connect () { consumerConnectSpy() }
            on (id, cb) { consumerOnSpy(); cb() }
            subscribe () { consumerSubscribeSpy() }
            consume () { consumerConsumeSpy() }
          },
          Producer: class Producer {
            constructor () { producerSpy() }
            connect () { producerConnectSpy() }
            on () { producerOnSpy() }
            setPollInterval () { producerSetPollIntervalSpy() }
          }
        }
      })
    })

    it('should create the Store object with the default processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'producer',
        PRODUCER_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_BUFFER: '',
        EVENT_STORE_POLL_INTERVAL: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.undefined()
      expect(store.log).to.be.a('function')

      expect(consumerSpy.called).to.be.false()
      expect(consumerConnectSpy.called).to.be.false()
      expect(consumerOnSpy.called).to.be.false()
      expect(consumerSubscribeSpy.called).to.be.false()
      expect(consumerConsumeSpy.called).to.be.false()

      expect(producerSpy.calledOnce).to.be.true()
      expect(producerConnectSpy.calledOnce).to.be.true()
      expect(producerOnSpy.calledOnce).to.be.true()
      expect(producerSetPollIntervalSpy.calledOnce).to.be.true()
    })

    it('should create the Store object with the consumer processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'consumer',
        CONSUMER_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_BUFFER: '',
        EVENT_STORE_POLL_INTERVAL: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.an('object')

      expect(consumerSpy.calledOnce).to.be.true()
      expect(consumerConnectSpy.calledOnce).to.be.true()
      expect(consumerOnSpy.calledOnce).to.be.true()
      expect(consumerSubscribeSpy.calledOnce).to.be.true()
      expect(consumerConsumeSpy.calledOnce).to.be.true()

      expect(producerSpy.called).to.be.false()
      expect(producerConnectSpy.called).to.be.false()
      expect(producerOnSpy.called).to.be.false()
      expect(producerSetPollIntervalSpy.called).to.be.false()
    })

    it('should create the Store object with the stream_processor processor type', () => {
      store = new Store({
        PROCESSOR_TYPE: 'stream_processor',
        PRODUCER_TOPIC: '',
        CONSUMER_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })

      expect(store).to.exist()

      expect(store.consumer).to.be.an('object')

      expect(consumerSpy.calledOnce).to.be.true()
      expect(consumerConnectSpy.calledOnce).to.be.true()
      expect(consumerOnSpy.calledOnce).to.be.true()
      expect(consumerSubscribeSpy.calledOnce).to.be.true()
      expect(consumerConsumeSpy.calledOnce).to.be.true()

      expect(producerSpy.calledOnce).to.be.true()
      expect(producerConnectSpy.calledOnce).to.be.true()
      expect(producerOnSpy.calledOnce).to.be.true()
      expect(producerSetPollIntervalSpy.calledOnce).to.be.true()
    })
  })

  describe('#log', () => {
    let produceStub, toJsonStub
    const produceStubs = [
      sinon.stub().returns(true),
      sinon.stub().returns(false)
    ]

    afterEach(() => {
      Store = null
      store = null

      produceStub = null
      toJsonStub = null
    })

    beforeEach(() => {
      produceStub = produceStubs.shift()
      toJsonStub = sinon.stub().returns({meta: {}})

      Store = proxyquire('../src/store', {
        'node-rdkafka': {
          KafkaConsumer: class KafkaConsumer {},
          Producer: class Producer {
            connect () {}
            on () {}
            produce () { return produceStub() }
            setPollInterval () {}
          }
        }
      })
      store = new Store({
        PROCESSOR_TYPE: 'producer',
        PRODUCER_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_BUFFER: '',
        EVENT_STORE_POLL_INTERVAL: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: ''
      })
    })

    it('should handle normal log posts', async () => {
      await expect(store.log('id', { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(toJsonStub.calledOnce).to.be.true()

      await expect(store.log(undefined, { toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(toJsonStub.calledTwice).to.be.true()
    })

    it('should be rejected', async () => {
      await expect(store.log('id', { toJSON () { return toJsonStub() } })).to.eventually.be.rejected()
      expect(toJsonStub.calledOnce).to.be.true()
    })
  })
})

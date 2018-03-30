/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('store', () => {
  let Store, store

  describe('#constructor', () => {
    let consumerSpy, connectSpy, onSpy, subscribeSpy, consumeSpy, observableStubs

    after(() => {
      Store = null
      store = null

      consumerSpy = null
      connectSpy = null
      onSpy = null
      subscribeSpy = null
      consumeSpy = null
      observableStubs = null
    })

    before(() => {
      consumerSpy = sinon.spy()
      connectSpy = sinon.spy()
      onSpy = sinon.spy()
      subscribeSpy = sinon.spy()
      consumeSpy = sinon.spy()
      observableStubs = {
        fromEventPattern: sinon.stub().returnsThis(),
        concatMap: sinon.stub().returnsThis(),
        subscribe: sinon.stub().returnsThis()
      }

      Store = proxyquire('../src/store', {
        'node-rdkafka': {
          KafkaConsumer: class KafkaConsumer {
            constructor () { consumerSpy() }
            connect () { connectSpy() }
            on (id, cb) { onSpy(); cb() }
            subscribe () { subscribeSpy() }
            consume () { consumeSpy() }
          }
        },
        'rxjs/Rx': { Observable: observableStubs }
      })
      store = new Store({
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TIMEOUT: '',
        EVENT_STORE_PROTOCOL: '',
        EVENT_STORE_OFFSET: '',
        AGGREGATE_LIST: ''
      })
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(consumerSpy.calledOnce).to.be.true()
      expect(connectSpy.calledOnce).to.be.true()
      expect(onSpy.calledOnce).to.be.true()
      expect(subscribeSpy.calledOnce).to.be.true()
      expect(consumeSpy.calledOnce).to.be.true()

      expect(observableStubs.fromEventPattern.calledOnce).to.be.true()
      expect(observableStubs.concatMap.calledOnce).to.be.true()
      expect(observableStubs.subscribe.calledOnce).to.be.true()
    })
  })
})

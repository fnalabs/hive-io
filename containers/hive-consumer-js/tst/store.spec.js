/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('store', () => {
  let Store, store

  describe('#constructor', () => {
    let consumerSpy, connectSpy, onSpy, subscribeSpy, consumeSpy, fromEventPatternStub, fromSpy, concatMapSpy, pipeStub, subscribeStub

    after(() => {
      Store = null
      store = null

      consumerSpy = null
      connectSpy = null
      onSpy = null
      subscribeSpy = null
      consumeSpy = null

      fromEventPatternStub = null
      fromSpy = null
      concatMapSpy = null
      pipeStub = null
      subscribeStub = null
    })

    before(() => {
      consumerSpy = sinon.spy()
      connectSpy = sinon.spy()
      onSpy = sinon.spy()
      subscribeSpy = sinon.spy()
      consumeSpy = sinon.spy()

      pipeStub = sinon.stub().returnsThis()
      subscribeStub = sinon.stub().returnsThis()
      fromEventPatternStub = sinon.stub().returns({
        pipe: pipeStub,
        subscribe: subscribeStub
      })
      fromSpy = sinon.spy()
      concatMapSpy = sinon.spy()

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
        'rxjs': {
          fromEventPattern: fromEventPatternStub,
          from: fromSpy
        },
        'rxjs/operators': { concatMap: concatMapSpy }
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

      expect(fromEventPatternStub.calledOnce).to.be.true()
      expect(fromSpy.called).to.be.false()
      expect(concatMapSpy.calledOnce).to.be.true()
      expect(pipeStub.calledOnce).to.be.true()
      expect(subscribeStub.calledOnce).to.be.true()
    })
  })
})

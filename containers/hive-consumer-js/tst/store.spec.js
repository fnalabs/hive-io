/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('store', () => {
  let Store, store

  describe('#constructor', () => {
    const sandbox = sinon.createSandbox()

    let consumerSpy, observableStubs

    after(() => {
      Store = null
      store = null

      consumerSpy = null
      observableStubs = null

      sandbox.restore()
    })

    before(() => {
      consumerSpy = sinon.spy()
      observableStubs = {
        fromEventPattern: sinon.stub().returnsThis(),
        concatMap: sinon.stub().returnsThis(),
        subscribe: sinon.stub().returnsThis()
      }

      Store = proxyquire('../src/store', {
        'kafka-node': {
          ConsumerGroup: class HighLevelProducer {
            constructor () { consumerSpy() }
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

      sandbox.spy(process, 'on')
      sandbox.spy(process, 'removeAllListeners')
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(consumerSpy.calledOnce).to.be.true()

      expect(observableStubs.fromEventPattern.calledOnce).to.be.true()
      expect(observableStubs.concatMap.calledOnce).to.be.true()
      expect(observableStubs.subscribe.calledOnce).to.be.true()
    })
  })
})

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

    let clientSpy, producerSpy, refreshSpy

    after(() => {
      Store = null
      store = null

      clientSpy = null
      producerSpy = null
      refreshSpy = null

      sandbox.restore()
    })

    before(() => {
      clientSpy = sinon.spy()
      producerSpy = sinon.spy()
      refreshSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        'kafka-node': {
          Client: class Client {
            constructor () { clientSpy() }
            refreshMetadata () { refreshSpy() }
          },
          HighLevelProducer: class HighLevelProducer {
            constructor () { producerSpy() }
          }
        }
      })
      store = new Store({
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        MODEL: ''
      })

      sandbox.spy(process, 'on')
      sandbox.spy(process, 'removeAllListeners')
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(store.log).to.be.a('function')

      expect(clientSpy.calledOnce).to.be.true()
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
      toJsonStub = null

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
          HighLevelProducer: class HighLevelProducer {
            send (data, cb) { sendStub(data, cb) }
          }
        }
      })
      store = new Store({
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: ''
      })

      sandbox.spy(process, 'on')
      sandbox.spy(process, 'removeAllListeners')
    })

    it('should handle normal log posts', async () => {
      await expect(store.log({ toJSON () { return toJsonStub() } })).to.eventually.be.fulfilled()
      expect(toJsonStub.calledOnce).to.be.true()
    })

    it('should be rejected', async () => {
      await expect(store.log({ toJSON () { return toJsonStub() } })).to.eventually.be.rejected()
      expect(toJsonStub.calledOnce).to.be.true()
    })
  })
})

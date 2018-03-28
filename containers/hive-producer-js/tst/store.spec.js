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
    let constructorSpy, connectSpy, onSpy, produceSpy

    after(() => {
      Store = null
      store = null

      constructorSpy = null
      connectSpy = null
      onSpy = null
      produceSpy = null
    })

    before(() => {
      constructorSpy = sinon.spy()
      connectSpy = sinon.spy()
      produceSpy = sinon.spy()
      onSpy = sinon.spy()

      Store = proxyquire('../src/store', {
        'node-rdkafka': {
          Producer: class Producer {
            constructor () { constructorSpy() }
            connect () { connectSpy() }
            on () { onSpy() }
            produce () { produceSpy() }
          }
        }
      })
      store = new Store({
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_BUFFER: ''
      })
    })

    it('should create the Store object', () => {
      expect(store).to.exist()

      expect(store.log).to.be.a('function')

      expect(constructorSpy.calledOnce).to.be.true()
      expect(connectSpy.calledOnce).to.be.true()
      expect(onSpy.calledOnce).to.be.true()
      expect(produceSpy.called).to.be.false()
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
          Producer: class Producer {
            connect () {}
            on () {}
            produce () { return produceStub() }
          }
        }
      })
      store = new Store({
        EVENT_STORE_TOPIC: '',
        EVENT_STORE_URL: '',
        EVENT_STORE_ID: '',
        EVENT_STORE_TYPE: '',
        EVENT_STORE_BUFFER: ''
      })
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

/* eslint-env mocha */
import proxyquire from 'proxyquire'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('observer', () => {
  let Observer, observer

  describe('#constructor', () => {
    let fromEventPatternStub, fromSpy, concatMapSpy, pipeStub, subscribeStub

    after(() => {
      Observer = null
      observer = null

      fromEventPatternStub = null
      fromSpy = null
      concatMapSpy = null
      pipeStub = null
      subscribeStub = null
    })

    before(() => {
      pipeStub = sinon.stub().returnsThis()
      subscribeStub = sinon.stub().returnsThis()
      fromEventPatternStub = sinon.stub().returns({
        pipe: pipeStub,
        subscribe: subscribeStub
      })
      fromSpy = sinon.spy()
      concatMapSpy = sinon.spy()

      Observer = proxyquire('../src/observer', {
        'rxjs': {
          fromEventPattern: fromEventPatternStub,
          from: fromSpy
        },
        'rxjs/operators': {
          concatMap: concatMapSpy
        }
      })
      observer = new Observer()
    })

    it('should create the Store object', () => {
      expect(observer).to.exist()

      expect(fromEventPatternStub.calledOnce).to.be.true()
      expect(fromSpy.called).to.be.false()
      expect(concatMapSpy.calledOnce).to.be.true()
      expect(pipeStub.calledOnce).to.be.true()
      expect(subscribeStub.calledOnce).to.be.true()
    })
  })
})

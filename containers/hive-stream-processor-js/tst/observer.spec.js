/* eslint-env mocha */
import proxyquire from 'proxyquire'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('observer', () => {
  let Observer, observer

  describe('#constructor', () => {
    let observableStubs

    after(() => {
      Observer = null
      observer = null

      observableStubs = null
    })

    before(() => {
      observableStubs = {
        fromEventPattern: sinon.stub().returnsThis(),
        concatMap: sinon.stub().returnsThis(),
        subscribe: sinon.stub().returnsThis()
      }

      Observer = proxyquire('../src/observer', {
        'rxjs/Rx': { Observable: observableStubs }
      })
      observer = new Observer()
    })

    it('should create the Store object', () => {
      expect(observer).to.exist()

      expect(observableStubs.fromEventPattern.calledOnce).to.be.true()
      expect(observableStubs.concatMap.calledOnce).to.be.true()
      expect(observableStubs.subscribe.calledOnce).to.be.true()
    })
  })
})

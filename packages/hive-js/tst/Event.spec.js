/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(dirtyChai)

describe('Event class', () => {
  let Event, event

  describe('#constructor', () => {
    let constructorSpy

    before(() => {
      constructorSpy = sinon.spy()
      Event = proxyquire('../src/Event', {
        './Message': class Message {
          constructor () {
            constructorSpy()
          }
                }
      })

      event = new Event()
    })

    it('should create a Event object successfully', () => {
      expect(event).to.exist()

      expect(event.timestamp).to.be.a('string')
      expect(Date.parse(event.timestamp)).to.be.a('number')

      expect(constructorSpy.calledOnce).to.be.true()
    })

    after(() => {
      Event = null
      event = null
    })
  })
})

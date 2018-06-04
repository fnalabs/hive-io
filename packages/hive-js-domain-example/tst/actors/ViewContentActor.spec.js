/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor, Model } from 'hive-io'

chai.use(dirtyChai)

// tests
describe('ViewContentActor', () => {
  let ViewContentActor, viewContentActor, emitSpy

  afterEach(() => {
    ViewContentActor = null
    viewContentActor = null

    emitSpy = null
  })

  beforeEach(async () => {
    emitSpy = sinon.spy()
    ViewContentActor = proxyquire('../../src/actors/messages/ViewContentActor', {
      '../../systems/LogSystem': new Proxy(Object, {
        construct: async function (Object) {
          return { emit: () => emitSpy() }
        }
      })
    })
    viewContentActor = await new ViewContentActor()
  })

  it('should create a ViewContentActor successfully', () => {
    expect(viewContentActor).to.be.an.instanceof(Actor)
    expect(viewContentActor.perform).to.be.a('function')
    expect(viewContentActor.replay).to.be.a('function')
    expect(viewContentActor.assign).to.be.a('function')
    expect(viewContentActor.parse).to.be.a('function')

    expect(emitSpy.called).to.be.false()
  })

  it('should process a View data successfully', async () => {
    const data = { meta: { urlParams: { postId: '1' } } }
    const { model } = await viewContentActor.perform(undefined, data)

    expect(model).to.be.an.instanceof(Model)
    expect(model).to.deep.equal({ postId: { id: '1' } })

    expect(emitSpy.calledOnce).to.be.true()
  })
})

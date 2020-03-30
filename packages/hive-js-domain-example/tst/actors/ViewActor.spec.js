/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor, Model, Schema } from 'hive-io'

import PostId from '../../src/schemas/json/PostId.json'
import ViewSchema from '../../src/schemas/json/View.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v2/models/PostId': PostId
}

chai.use(dirtyChai)

// constants
const viewData = { type: 'View', payload: { id: 'id' } }

describe('ViewActor', () => {
  let ViewActor, viewActor, viewSchema, connectStub, endSpy, requestSpy

  afterEach(() => {
    ViewActor = null
    viewActor = null
    viewSchema = null

    connectStub = null
    endSpy = null
    requestSpy = null
  })

  beforeEach(async () => {
    endSpy = sinon.spy()
    requestSpy = sinon.spy()

    connectStub = sinon.stub().returns({
      end () { endSpy() },
      request () { requestSpy(); return this }
    })

    viewSchema = await new Schema(ViewSchema, REFS)

    ViewActor = proxyquire('../../src/actors/ViewActor', {
      '../util/httpConnect': connectStub
    })
    viewActor = await new ViewActor()
  })

  it('should create a ViewActor successfully', () => {
    expect(viewActor).to.be.an.instanceof(Actor)
    expect(viewActor.perform).to.be.a('function')
    expect(viewActor.replay).to.be.a('function')
    expect(viewActor.assign).to.be.a('function')
    expect(viewActor.parse).to.be.a('function')

    expect(connectStub.calledOnce).to.be.true()
  })

  it('should process a View sent through an Actor System', async () => {
    const viewModel = await new Model(viewData, viewSchema)
    await viewActor.perform(viewModel)

    expect(requestSpy.calledOnce).to.be.true()
    expect(endSpy.calledOnce).to.be.true()
  })
})

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
  let ViewActor, viewActor, viewSchema, requestSpy, endSpy

  afterEach(() => {
    ViewActor = null
    viewActor = null
    viewSchema = null

    endSpy = null
    requestSpy = null
  })

  beforeEach(async () => {
    endSpy = sinon.spy()
    requestSpy = sinon.spy()

    viewSchema = await new Schema(ViewSchema, REFS)

    ViewActor = proxyquire('../../src/actors/ViewActor', {
      http: { request () { requestSpy(); return this }, end () { endSpy() } }
    })
    viewActor = await new ViewActor()
  })

  it('should create a ViewActor successfully', () => {
    expect(viewActor).to.be.an.instanceof(Actor)
    expect(viewActor.perform).to.be.a('function')
    expect(viewActor.replay).to.be.a('function')
    expect(viewActor.assign).to.be.a('function')
    expect(viewActor.parse).to.be.a('function')
  })

  it('should process a View sent through an Actor System', async () => {
    const viewModel = await new Model(viewData, viewSchema)
    await viewActor.perform(viewModel)

    expect(requestSpy.calledOnce).to.be.true()
    expect(endSpy.calledOnce).to.be.true()
  })
})

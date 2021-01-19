/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'
import { Actor, Model, Schema } from 'hive-io'

import ContentId from '../../src/schemas/json/ContentId.json'
import ViewSchema from '../../src/schemas/json/View.json'

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentId
}

chai.use(dirtyChai)
proxyquire.noCallThru()

// constants
const viewData = { type: 'View', payload: { id: 'id' } }
const viewTraceData = { type: 'View', payload: { id: 'id', traceparent: 'test' } }

describe('ViewActor', () => {
  let ViewActor, viewActor, viewSchema, connectStub, closeSpy, endSpy, onSpy, requestSpy, setEncodingSpy

  afterEach(() => {
    ViewActor = null
    viewActor = null
    viewSchema = null

    connectStub = null
    closeSpy = null
    endSpy = null
    onSpy = null
    requestSpy = null
    setEncodingSpy = null
  })

  beforeEach(async () => {
    closeSpy = spy()
    endSpy = spy()
    onSpy = spy()
    requestSpy = spy()
    setEncodingSpy = spy()

    connectStub = stub().returns({
      close () { closeSpy() },
      end () { endSpy() },
      on () { onSpy() },
      request () { requestSpy(); return this },
      setEncoding () { setEncodingSpy() }
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
  })

  it('should process a View sent through an Actor System', async () => {
    const viewModel = await new Model(viewData, viewSchema)
    await viewActor.perform(viewModel)

    expect(connectStub.calledOnce).to.be.true()
    expect(setEncodingSpy.calledOnce).to.be.true()
    expect(onSpy.calledOnce).to.be.true()
    expect(requestSpy.calledOnce).to.be.true()
    expect(endSpy.calledOnce).to.be.true()
  })

  it('should process a View with trace data sent through an Actor System', async () => {
    const viewModel = await new Model(viewTraceData, viewSchema)
    await viewActor.perform(viewModel)

    expect(connectStub.calledOnce).to.be.true()
    expect(setEncodingSpy.calledOnce).to.be.true()
    expect(onSpy.calledOnce).to.be.true()
    expect(requestSpy.calledOnce).to.be.true()
    expect(endSpy.calledOnce).to.be.true()
  })

  it('should handle "end" event successfully', () => {
    const closeSpy = spy()
    viewActor.connection = { close: () => closeSpy() }
    viewActor.onEnd()

    expect(closeSpy.calledOnce).to.be.true()
  })
})

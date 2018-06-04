/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor, Model, Schema } from 'hive-io'

import LogSchema from '../../src/schemas/json/Log.json'

chai.use(dirtyChai)

// constants
const logData = { type: 'Log', payload: { url: { pathname: '/posts' }, urlParams: { postId: '1' }, method: 'GET' } }

describe('LogActor', () => {
  let LogActor, logActor, logSchema, emitSpy, loggerStub

  afterEach(() => {
    LogActor = null
    logActor = null
    logSchema = null

    emitSpy = null
    loggerStub = null
  })

  beforeEach(async () => {
    emitSpy = sinon.spy()
    loggerStub = sinon.stub().returns({
      emit: () => emitSpy()
    })

    logSchema = await new Schema(LogSchema)

    LogActor = proxyquire('../../src/actors/LogActor', {
      '../util/fluentConnect': () => loggerStub()
    })
    logActor = await new LogActor()
  })

  it('should create a LogActor successfully', () => {
    expect(logActor).to.be.an.instanceof(Actor)
    expect(logActor.perform).to.be.a('function')
    expect(logActor.replay).to.be.a('function')
    expect(logActor.assign).to.be.a('function')
    expect(logActor.parse).to.be.a('function')
  })

  it('should process a Log sent through an Actor System', async () => {
    const logModel = await new Model(logData, logSchema)
    await logActor.perform(logModel)

    expect(emitSpy.calledOnce).to.be.true()
  })
})

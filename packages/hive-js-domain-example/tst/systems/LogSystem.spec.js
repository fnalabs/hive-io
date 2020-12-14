/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor, Model, Schema, System } from 'hive-io'

import ContentId from '../../src/schemas/json/ContentId.json'
import ViewSchema from '../../src/schemas/json/View.json'

chai.use(dirtyChai)

// constants
const REFS = {
  'https://hiveframework.io/api/models/ContentId': ContentId
}

const viewData = { type: 'View', payload: { id: 'test' } }

describe('LogSystem', () => {
  let LogSystem, logSystem, viewSchema, viewModel, performSpy

  afterEach(() => {
    LogSystem = null
    logSystem = null
    viewSchema = null
    viewModel = null

    performSpy = null
  })

  beforeEach(async () => {
    performSpy = sinon.spy()

    viewSchema = await new Schema(ViewSchema, REFS)
    viewModel = await new Model(viewData, viewSchema, { immutable: true })

    LogSystem = proxyquire('../../src/systems/LogSystem', {
      '../actors/ViewActor': class ViewActor extends Actor {
        perform () { performSpy() }
      }
    })
    logSystem = await new LogSystem()
  })

  it('should create a new log system correctly', () => {
    expect(logSystem).to.be.an.instanceof(System)
    expect(logSystem.on).to.be.a('function')
    expect(logSystem.emit).to.be.a('function')

    expect(performSpy.called).to.be.false()
  })

  it('should handle an emitted view event successfully', done => {
    // define results Actor to assert results
    class ResultsActor extends Actor {
      perform () {
        expect(performSpy.calledOnce).to.be.true()
        done()
      }
    }
    const resultsActor = new ResultsActor(viewSchema)

    // init test system
    expect(logSystem.on(viewSchema, resultsActor)).to.be.an.instanceof(System)
    expect(performSpy.called).to.be.false()

    logSystem.emit(viewModel)
  })
})

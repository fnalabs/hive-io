/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { parse, Actor, Model, Schema, System } from 'hive-io'

import LogSchema from '../../src/schemas/json/Log.json'

chai.use(dirtyChai)

// constants
const logData = { type: 'Log', payload: { url: { pathname: '/posts' }, urlParams: { postId: '1' }, method: 'GET' } }

describe('LogSystem', () => {
  let LogSystem, logSystem, logSchema, logModel, performSpy

  afterEach(() => {
    LogSystem = null
    logSystem = null
    logSchema = null
    logModel = null

    performSpy = null
  })

  beforeEach(async () => {
    class LogActor extends Actor {
      perform () { performSpy() }
    }

    performSpy = sinon.spy()

    logSchema = await new Schema(LogSchema)
    logModel = await new Model(logData, logSchema, { immutable: true })

    LogSystem = proxyquire('../../src/systems/LogSystem', {
      '../actors/LogActor': new Proxy(LogActor, {
        construct: async function (LogActor) {
          return new LogActor(parse`/log`, logSchema)
        }
      })
    })
    logSystem = await new LogSystem()
  })

  it('should create a new log system correctly', () => {
    expect(logSystem).to.be.an.instanceof(System)
    expect(logSystem.on).to.be.a('function')
    expect(logSystem.emit).to.be.a('function')

    expect(performSpy.called).to.be.false()
  })

  it('should handle an emitted log event successfully', done => {
    // define results Actor to assert results
    class ResultsActor extends Actor {
      perform () {
        expect(performSpy.calledOnce).to.be.true()
        done()
      }
    }
    const resultsActor = new ResultsActor(parse`/results`, logSchema)

    // init test system
    expect(logSystem.on(logSchema, resultsActor)).to.be.an.instanceof(System)
    expect(performSpy.called).to.be.false()
    expect(logSystem.emit(logModel))
  })
})

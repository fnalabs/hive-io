/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'
import Schema from 'schema-json-js'

import { Model } from 'model-json-js'

import { Actor } from '../src/Actor'
import { parse } from '../src/util'

import System from '../src/System'

// schemas
import TestSchema from './schemas/TestSchema.json'

// constants
const data = {
  type: 'Test',
  payload: { view: 1 },
  meta: {
    schema: 'https://hiveframework.io/api/v1/models/Test'
  }
}

chai.use(dirtyChai)

// tests
describe('class System', () => {
  let testSystem, testSchema, testModel, testActor, performSpy

  afterEach(() => {
    testSystem = null
    testSchema = null
    testModel = null
    testActor = null
    performSpy = null
  })

  beforeEach(async () => {
    performSpy = sinon.spy()

    class TestActor extends Actor {
      perform () { performSpy() }
    }
    testSchema = await new Schema(TestSchema)
    testModel = await new Model(data, testSchema, { immutable: true })
    testActor = new TestActor(parse`/test`, testSchema)
    testSystem = new System()
  })

  describe('#constructor', () => {
    it('should create an Actor System', () => {
      expect(testSystem).to.be.an.instanceof(System)
      expect(testSystem.on).to.be.a('function')
      expect(testSystem.emit).to.be.a('function')
    })
  })

  describe('#on', () => {
    it('should bind an actor to a schema type and function successfully', done => {
      // define results Actor to assert results
      class ResultsActor extends Actor {
        perform () {
          expect(this).to.be.an.instanceof(Actor)
          expect(performSpy.calledOnce).to.be.true()
          done()
        }
      }
      const resultsActor = new ResultsActor(parse`/results`, testSchema)

      // init test system
      expect(testSystem.on(testSchema, testActor).on(testSchema, resultsActor)).to.be.an.instanceof(System)
      expect(performSpy.called).to.be.false()
      expect(testSystem.emit(testModel))
    })

    it('should throw an error on schema missing title', () => {
      try {
        testSystem.on()
      } catch (e) {
        expect(e.message).to.equal('#on: schema.title must be a string')
      }

      try {
        testSystem.on({})
      } catch (e) {
        expect(e.message).to.equal('#on: schema.title must be a string')
      }

      try {
        testSystem.on({ title: false })
      } catch (e) {
        expect(e.message).to.equal('#on: schema.title must be a string')
      }
    })

    it('should throw an error on invalid Actor type', () => {
      try {
        testSystem.on({ title: 'true' }, { perform: () => {} })
      } catch (e) {
        expect(e.message).to.equal('#on: actor is not an Actor')
      }
    })
  })

  describe('#emit', () => {
    it('should throw an error on invalid Model type', () => {
      try {
        testSystem.emit({})
      } catch (e) {
        expect(e.message).to.equal('#emit: model is not a Model')
      }

      try {
        testSystem.emit({ type: 'Test' })
      } catch (e) {
        expect(e.message).to.equal('#emit: model is not a Model')
      }
    })
  })
})

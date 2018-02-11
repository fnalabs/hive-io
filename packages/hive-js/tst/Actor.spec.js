/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import Schema from 'schema-json-js'

import Model from '../src/Model'

import { Actor } from '../src/Actor'
import { parse } from '../src/util'

// schemas
import TestSchema from './schemas/TestSchema.json'

// constants
const payload = {
  data: { view: 1 },
  meta: {
    model: 'Test',
    schema: 'https://hiveframework.io/api/v1/models/Test'
  }
}

chai.use(dirtyChai)

// tests
describe('class Actor', () => {
  let testActor, testSchema

  after(() => {
    testActor = null
    testSchema = null
  })

  before(async () => {
    testSchema = await new Schema(TestSchema)
    testActor = new Actor(parse`/view/${'viewId'}`, testSchema)
  })

  describe('#constructor', () => {
    it('should create a basic Model Actor', () => {
      expect(testActor).to.be.an.instanceof(Actor)
      expect(testActor.perform).to.be.a('function')
      expect(testActor.replay).to.be.a('function')
      expect(testActor.assign).to.be.a('function')
      expect(testActor.parse).to.be.a('function')
    })

    it('should create a basic Model Actor with the default url', () => {
      const testDefaultActor = new Actor(undefined, testSchema)

      expect(testDefaultActor).to.be.an.instanceof(Actor)
    })

    it('should throw errors for invalid arguments passed', () => {
      try {
        new Actor('/incorrect/url', testSchema) // eslint-disable-line
      } catch (e) {
        expect(e.message).to.equal('#Actor: url must be an object of parsed values')
      }

      try {
        new Actor(parse`/test`, {}) // eslint-disable-line
      } catch (e) {
        expect(e.message).to.equal('#Actor: model schema must be a Schema')
      }
    })
  })

  describe('#perform', () => {
    it('should create, validate, and return the new model', async () => {
      const { model } = await testActor.perform(payload)

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 1 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should assign, validate, and return an existing model', async () => {
      const testModel = await new Model({ meta: { model: 'Test' } }, testSchema)
      const { model } = await testActor.perform(payload, testModel)

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 1 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should return the model unchanged', async () => {
      const testModel = await new Model({ meta: { model: 'Test' } }, testSchema)
      const { model } = await testActor.perform({ meta: { model: 'Test' } }, testModel)

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({})
      expect(await Model.validate(model)).to.be.false()
      expect(Model.errors(model)[0]).to.equal('#required: value does not have all required properties')
    })

    it('should throw an error if bad data is passed', async () => {
      const testModel = await new Model(payload, testSchema)

      try {
        await testActor.perform({ data: { view: 'something' }, meta: { model: 'Test' } }, testModel)
      } catch (e) {
        expect(e.message).to.deep.equal('#type: value is not a(n) number')
      }
    })
  })

  describe('#replay', () => {
    it('should replay a single payload successfully', async () => {
      const model = await testActor.replay(payload)
      expect(model).to.deep.equal({ view: 1 })
    })

    it('should replay a sequence of data successfully', async () => {
      const model = await testActor.replay([payload, payload, payload])
      expect(model).to.deep.equal({ view: 1 })
    })
  })

  describe('#assign', () => {
    it('should assign data to a model', async () => {
      let model = await new Model({ test: 2 }, testSchema)
      model = testActor.assign(model, payload.data)

      expect(model).to.deep.equal({ view: 1 })
    })

    it('should assign complex data data to a model', async () => {
      let model = await new Model({ view: 2 }, testSchema)
      model = testActor.assign(model, { ...payload.data, another: { nested: 'object' } })

      expect(model).to.deep.equal({ view: 1, another: { nested: 'object' } })
    })
  })

  describe('#parse', () => {
    it('should parse a given url that matches the template correctly', () => {
      expect(testActor.parse('/view/12345')).to.deep.equal({ viewId: '12345' })
      expect(testActor.parse('/view/1234567890?some=query&string=values')).to.deep.equal({ viewId: '1234567890' })

      const actor = new Actor(parse`/test/${'testId'}/child`, testSchema)
      expect(actor.parse('/test/12345/child')).to.deep.equal({ testId: '12345' })
    })

    it('should parse a given url that matches the template correctly', () => {
      const actor = new Actor(parse`/test`, testSchema)
      expect(actor.parse('/test/12345')).to.deep.equal({})
      expect(actor.parse('/test/1234567890?some=query&string=values')).to.deep.equal({})
    })
  })
})

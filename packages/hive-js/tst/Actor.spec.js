/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import { Model, Schema } from 'model-json-js'

import { Actor } from '../src/Actor'
import { parse } from '../src/util'

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
      const testDefaultActor = new Actor(testSchema)

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
    it('should validate and return the model created from data', async () => {
      const { model } = await testActor.perform(undefined, data)

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 1 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should validate and return an existing model', async () => {
      const testModel = await new Model({ type: 'Test' }, testSchema)
      const { model } = await testActor.perform(testModel, data)

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 1 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should throw an error if bad data is passed', async () => {
      const testModel1 = await new Model({ type: 'Test' }, testSchema)

      try {
        await testActor.perform(testModel1, { type: 'Test' })
      } catch (e) {
        expect(e.message).to.equal('#required: value does not have all required properties')
      }

      const testModel2 = await new Model(data, testSchema)
      try {
        await testActor.perform(testModel2, { type: 'Test', payload: { view: 'something' } })
      } catch (e) {
        expect(e.message).to.deep.equal('#type: value is not a(n) number')
      }
    })
  })

  describe('#replay', () => {
    it('should replay undefined data successfully', async () => {
      const { model } = await testActor.replay()
      expect(model).to.be.undefined()
    })

    it('should replay a single data payload successfully', async () => {
      const { model } = await testActor.replay(data)
      expect(model).to.deep.equal({ view: 1 })
    })

    it('should replay a sequence of data successfully', async () => {
      const { model } = await testActor.replay([data, data, data])
      expect(model).to.deep.equal({ view: 1 })
    })
  })

  describe('#assign', () => {
    it('should assign data to a model', async () => {
      let model = await new Model({ type: 'Test' }, testSchema)
      model = testActor.assign(model, data.payload)

      expect(model).to.deep.equal({ view: 1 })
    })

    it('should assign complex data payload to init a model\'s complex nested object', async () => {
      let model = await new Model({ type: 'Test', payload: { view: 2 } }, testSchema)
      model = testActor.assign(model, { ...data.payload, another: { nested: 'object' } })

      expect(model).to.deep.equal({ view: 1, another: { nested: 'object' } })
    })

    it('should assign complex data payload to an existing model\'s complex nested object', async () => {
      let model = await new Model({ type: 'Test', payload: { view: 2, another: { complex: 'object', nested: 'arbitrarily' } } }, testSchema)
      model = testActor.assign(model, { ...data.payload, another: { nested: 'object' } })

      expect(model).to.deep.equal({ view: 1, another: { complex: 'object', nested: 'object' } })
    })

    it('should assign no data successfully', async () => {
      let model = await new Model({ type: 'Test' }, testSchema)
      model = testActor.assign(model)

      expect(model).to.deep.equal({})
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

/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import Schema from 'schema-json-js'

import Model from '../src/Model'

// constants
const TestSchema = {
  title: 'Test',
  $id: 'https://hiveframework.io/api/v1/models/Test',
  properties: {
    test: {
      type: 'string'
    },
    another: {
      type: 'string'
    }
  },
  required: ['test']
}
const meta = {
  schema: 'https://hiveframework.io/api/v1/models/Test'
}

chai.use(dirtyChai)

// tests
describe('class Model', () => {
  let testSchema

  describe('#constructor', () => {
    context('w/ a Schema', () => {
      after(() => {
        testSchema = null
      })

      before(async () => {
        testSchema = await new Schema(TestSchema)
      })

      it('should asyncronously create a new model', async () => {
        const testData = { type: 'Test', payload: { test: 'object' }, meta }
        const test = await new Model(testData, testSchema)
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
        expect(Model.schema(test)).to.be.an.instanceof(Schema)
      })

      it('should asyncronously create a new immutable model', async () => {
        const testData = { type: 'Test', payload: { test: 'object' }, meta }
        const test = await new Model(testData, testSchema, { immutable: true })
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
        expect(test).to.be.frozen()
        expect(Model.schema(test)).to.be.an.instanceof(Schema)
      })

      it('should throw an error if data is invalid', async () => {
        try {
          const testData = { payload: { test: 'object' }, meta }
          await new Model(testData, testSchema)
        } catch (e) {
          expect(e.message).to.equal('#Model: data type does not match Schema')
        }

        try {
          const testData = { type: 'Test', payload: { test: 1 }, meta }
          await new Model(testData, testSchema)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        try {
          const testData = { type: 'Test', payload: null, meta }
          await new Model(testData, testSchema)
        } catch (e) {
          expect(e.message).to.equal('#Model: payload must be an object if defined')
        }
      })
    })

    context('w/ Schema as JSON', () => {
      it('should asyncronously create a new model', async () => {
        const testData = { type: 'Test', payload: { test: 'object' }, meta }
        const test = await new Model(testData, TestSchema)
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
      })

      it('should asyncronously create a new model with some overridden descriptors', async () => {
        const testData = { type: 'Test', payload: { test: 'object' }, meta }
        const test = await new Model(testData, TestSchema, { enumerable: true })
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
      })

      it('should asyncronously create a new model with no data', async () => {
        const test = await new Model({ type: 'Test', meta }, { title: TestSchema.title, $id: TestSchema.$id })
        expect(test).to.deep.equal({})
        expect(test.toJSON()).to.deep.equal({ type: TestSchema.title })
        expect(test).to.be.an.instanceof(Model)
      })
    })

    context('w/ EmptySchema', () => {
      it('should asyncronously create a new model', async () => {
        expect(await new Model({})).to.deep.equal({})
        expect(await new Model({ payload: { id: 'object' } })).to.deep.equal({ id: 'object' })
        expect(await new Model({ payload: { test: ['list'] } })).to.deep.equal({ test: ['list'] })
        expect(await new Model({ payload: { test: { nested: 'object' } } })).to.deep.equal({ test: { nested: 'object' } })
      })

      it('should always validate as true if no Schema is defined', async () => {
        let testModel = await new Model({ payload: { id: 'object' } })

        expect(await Model.validate(testModel)).to.be.true()
        expect(Model.errors(testModel)).to.deep.equal([])

        testModel = await new Model({ payload: { id: 'object', another: { more: { complex: 'object' } } } })

        expect(await Model.validate(testModel)).to.be.true()
        expect(Model.errors(testModel)).to.deep.equal([])
      })
    })

    context('w/ errors', () => {
      it('should throw an error when passing a primitive as data', async () => {
        try {
          await new Model(null)
        } catch (e) {
          expect(e.message).to.equal('Model data must be an object')
        }
      })
    })
  })

  describe('defining operations', () => {
    after(() => {
      testSchema = null
    })

    before(async () => {
      testSchema = await new Schema(TestSchema)
    })

    it('should validate data before defining on the model instance', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object' }, meta }, testSchema)
      Object.defineProperty(testModel, 'another', { value: 'string' })

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object', another: 'string' })
    })

    it('should fail validation if new property value is invalid', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object' }, meta }, testSchema)
      Object.defineProperty(testModel, 'another', { value: 1 })

      expect(await Model.validate(testModel)).to.be.false()
      expect(Model.errors(testModel)).to.deep.equal(['#type: value is not a string'])
    })
  })

  describe('deleting operations', () => {
    after(() => {
      testSchema = null
    })

    before(async () => {
      testSchema = await new Schema(TestSchema)
    })

    it('should validate a property when deleted successfully', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object', another: 'string' }, meta }, testSchema)
      delete testModel.another

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object' })
    })

    it('should fail validation when deleting a required property', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object', another: 'string' }, meta }, testSchema)
      delete testModel.test

      expect(await Model.validate(testModel)).to.be.false()
      expect(Model.errors(testModel)).to.deep.equal(['#required: value does not have all required properties'])
    })
  })

  describe('updating operations', () => {
    after(() => {
      testSchema = null
    })

    before(async () => {
      testSchema = await new Schema(TestSchema)
    })

    it('should validate a property when its value changes successfully', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object' }, meta }, testSchema)
      testModel.test = 'string'

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'string' })
    })

    it('should fail validation when updating a property to an invalid value', async () => {
      const testModel = await new Model({ type: 'Test', payload: { test: 'object' }, meta }, testSchema)
      testModel.test = 1

      expect(await Model.validate(testModel)).to.be.false()
      expect(Model.errors(testModel)).to.deep.equal(['#type: value is not a string'])
    })
  })

  describe('#toJSON', () => {
    context('w/ a Schema', () => {
      after(() => {
        testSchema = null
      })

      before(async () => {
        testSchema = await new Schema(TestSchema)
      })

      it('should return the JSON representation of the Model', async () => {
        const model = await new Model({ type: 'Test', payload: { test: 'object' }, meta: { ...meta, version: 1 } }, testSchema)
        const json = model.toJSON()

        expect(json.type).to.equal('Test')
        expect(json.payload).to.deep.equal({ test: 'object' })
        expect(json.meta.version).to.equal(1)
      })
    })

    context('w/ EmptySchema', () => {
      it('should return the JSON representation of the Model', async () => {
        const model = await new Model({ payload: { id: 'object' } })
        const json = model.toJSON()

        expect(json.payload).to.deep.equal({ id: 'object' })
      })
    })
  })

  describe('#version', () => {
    it('should return the correct version if defined', async () => {
      const model = await new Model({ payload: { id: 'object' }, meta: { version: 1 } })

      expect(model).to.deep.equal({ id: 'object' })
      expect(Model.version(model)).to.equal(1)
    })

    it('should return undefined if version is not provided', async () => {
      const model = await new Model({ payload: { id: 'object' } })

      expect(model).to.deep.equal({ id: 'object' })
      expect(Model.version(model)).to.be.undefined()
    })
  })
})

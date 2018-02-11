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
  model: 'Test',
  schema: 'https://hiveframework.io/api/v1/models/Test'
}
const defaultMeta = {
  model: 'Default',
  schema: 'https://hiveframework.io/api/v1/models/Default'
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
        const testPayload = { data: { test: 'object' }, meta }
        const test = await new Model(testPayload, testSchema)
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
        expect(Model.schema(test)).to.be.an.instanceof(Schema)
      })

      it('should asyncronously create a new immutable model', async () => {
        const testPayload = { data: { test: 'object' }, meta }
        const test = await new Model(testPayload, testSchema, { immutable: true })
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
        expect(test).to.be.frozen()
        expect(Model.schema(test)).to.be.an.instanceof(Schema)
      })

      it('should throw an error if data is invalid', async () => {
        try {
          const testPayload = { data: { test: 1 }, meta }
          await new Model(testPayload, testSchema)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        try {
          const testPayload = { data: null, meta }
          await new Model(testPayload, testSchema)
        } catch (e) {
          expect(e.message).to.equal('#Model: data must be an object if defined')
        }
      })
    })

    context('w/ Schema as JSON', () => {
      it('should asyncronously create a new model', async () => {
        const testPayload = { data: { test: 'object' }, meta }
        const test = await new Model(testPayload, TestSchema)
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
      })

      it('should asyncronously create a new model with some overridden descriptors', async () => {
        const testPayload = { data: { test: 'object' }, meta }
        const test = await new Model(testPayload, TestSchema, { enumerable: true })
        expect(test).to.deep.equal({ test: 'object' })
        expect(test).to.be.an.instanceof(Model)
      })

      it('should asyncronously create a new model with no data', async () => {
        const test = await new Model({ meta }, { title: meta.model, $id: meta.schema })
        expect(test).to.deep.equal({})
        expect(test.toJSON()).to.deep.equal({ meta: { model: meta.model } })
        expect(test).to.be.an.instanceof(Model)
      })
    })

    context('w/ DefaultSchema', () => {
      it('should asyncronously create a new model', async () => {
        expect(await new Model({ data: { id: 'object' }, meta: defaultMeta })).to.deep.equal({ id: 'object' })
        expect(await new Model({ data: { id: 'object', test: 1 }, meta: defaultMeta })).to.deep.equal({ id: 'object', test: 1 })
        expect(await new Model({ data: { id: 'object', test: ['list'] }, meta: defaultMeta })).to.deep.equal({ id: 'object', test: ['list'] })
        expect(await new Model({ data: { id: 'object', test: { nested: 'object' } }, meta: defaultMeta })).to.deep.equal({ id: 'object', test: { nested: 'object' } })
      })

      it('should always validate as true if no Schema is defined', async () => {
        let testModel = await new Model({ data: { id: 'object' }, meta: defaultMeta })

        expect(await Model.validate(testModel)).to.be.true()
        expect(Model.errors(testModel)).to.deep.equal([])

        testModel = await new Model({ data: { id: 'object', another: { more: { complex: 'object' } } }, meta: defaultMeta })

        expect(await Model.validate(testModel)).to.be.true()
        expect(Model.errors(testModel)).to.deep.equal([])
      })
    })

    context('w/ errors', () => {
      it('should throw an error when passing a primitive as a payload', async () => {
        try {
          await new Model(null)
        } catch (e) {
          expect(e.message).to.equal('Model payload must be an object')
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
      const testModel = await new Model({ data: { test: 'object' }, meta }, testSchema)
      Object.defineProperty(testModel, 'another', { value: 'string' })

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object', another: 'string' })
    })

    it('should fail validation if new property value is invalid', async () => {
      const testModel = await new Model({ data: { test: 'object' }, meta }, testSchema)
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
      const testModel = await new Model({ data: { test: 'object', another: 'string' }, meta }, testSchema)
      delete testModel.another

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object' })
    })

    it('should fail validation when deleting a required property', async () => {
      const testModel = await new Model({ data: { test: 'object', another: 'string' }, meta }, testSchema)
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
      const testModel = await new Model({ data: { test: 'object' }, meta }, testSchema)
      testModel.test = 'string'

      expect(await Model.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'string' })
    })

    it('should fail validation when updating a property to an invalid value', async () => {
      const testModel = await new Model({ data: { test: 'object' }, meta }, testSchema)
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
        const model = await new Model({ data: { test: 'object' }, meta: { ...meta, version: 1 } }, testSchema)
        const json = model.toJSON()

        expect(json.data).to.deep.equal({ test: 'object' })
        expect(json.meta.model).to.equal('Test')
        expect(json.meta.version).to.equal(1)
      })
    })

    context('w/ DefaultSchema', () => {
      it('should return the JSON representation of the Model', async () => {
        const model = await new Model({ data: { id: 'object' }, meta: { model: 'Default', schema: 'https://hiveframework.io/api/v1/models/Default' } })
        const json = model.toJSON()

        expect(json.data).to.deep.equal({ id: 'object' })
        expect(json.meta.model).to.equal('Default')
      })
    })
  })
})

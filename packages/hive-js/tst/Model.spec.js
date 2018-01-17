/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import Schema from 'schema-json-js'

import Model, { SEQUENCE } from '../src/Model'

const TestSchema = {
  title: 'TestModel',
  $id: 'https://hiveframework.io/api/v1/models/TestModel',
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

chai.use(dirtyChai)

describe('Model class', () => {
  let TestModel

  describe('#constructor', () => {
    context('w/ a Schema', () => {
      after(() => {
        TestModel = null
      })

      before(async () => {
        TestModel = await new Model(await new Schema(TestSchema))
      })

      it('should asyncronously create a new model', async () => {
        expect(await new TestModel({ test: 'object' })).to.deep.equal({ test: 'object' })
      })

      it('should throw an error if data is invalid', async () => {
        try {
          await new TestModel({ test: 1 })
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        try {
          await new TestModel(null)
        } catch (e) {
          expect(e.message).to.equal('Model data must be an object')
        }
      })
    })

    context('w/ DefaultSchema', () => {
      after(() => {
        TestModel = null
      })

      before(async () => {
        TestModel = await new Model()
      })

      it('should asyncronously create a new model', async () => {
        expect(await new TestModel({ id: 'object' })).to.deep.equal({ id: 'object' })
        expect(await new TestModel({ id: 'object', test: 1 })).to.deep.equal({ id: 'object', test: 1 })
        expect(await new TestModel({ id: 'object', test: ['list'] })).to.deep.equal({ id: 'object', test: ['list'] })
        expect(await new TestModel({ id: 'object', test: { nested: 'object' } })).to.deep.equal({ id: 'object', test: { nested: 'object' } })
      })

      it('should always validate as true if no Schema is defined', async () => {
        let testModel = await new TestModel({ id: 'object' })

        expect(await TestModel.validate(testModel)).to.be.true()
        expect(TestModel.errors(testModel)).to.deep.equal([])

        testModel = await new TestModel({ id: 'object', another: { more: { complex: 'object' } } })

        expect(await TestModel.validate(testModel)).to.be.true()
        expect(TestModel.errors(testModel)).to.deep.equal([])
      })
    })
  })

  describe('defining operations', () => {
    after(() => {
      TestModel = null
    })

    before(async () => {
      TestModel = await new Model(await new Schema(TestSchema))
    })

    it('should validate data before defining on the model instance', async () => {
      const testModel = await new TestModel({ test: 'object' })
      Object.defineProperty(testModel, 'another', { value: 'string' })

      expect(await TestModel.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object', another: 'string' })
    })

    it('should fail validation if new property value is invalid', async () => {
      const testModel = await new TestModel({ test: 'object' })
      Object.defineProperty(testModel, 'another', { value: 1 })

      expect(await TestModel.validate(testModel)).to.be.false()
      expect(TestModel.errors(testModel)).to.deep.equal(['#type: value is not a string'])
    })
  })

  describe('deleting operations', () => {
    after(() => {
      TestModel = null
    })

    before(async () => {
      TestModel = await new Model(await new Schema(TestSchema))
    })

    it('should validate a property when deleted successfully', async () => {
      const testModel = await new TestModel({ test: 'object', another: 'string' })
      delete testModel.another

      expect(await TestModel.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'object' })
    })

    it('should fail validation when deleting a required property', async () => {
      const testModel = await new TestModel({ test: 'object', another: 'string' })
      delete testModel.test

      expect(await TestModel.validate(testModel)).to.be.false()
      expect(TestModel.errors(testModel)).to.deep.equal(['#required: value does not have all required properties'])
    })
  })

  describe('updating operations', () => {
    after(() => {
      TestModel = null
    })

    before(async () => {
      TestModel = await new Model(await new Schema(TestSchema))
    })

    it('should validate a property when its value changes successfully', async () => {
      const testModel = await new TestModel({ test: 'object' })
      testModel.test = 'string'

      expect(await TestModel.validate(testModel)).to.be.true()
      expect(testModel).to.deep.equal({ test: 'string' })
    })

    it('should fail validation when updating a property to an invalid value', async () => {
      const testModel = await new TestModel({ test: 'object' })
      testModel.test = 1

      expect(await TestModel.validate(testModel)).to.be.false()
      expect(TestModel.errors(testModel)).to.deep.equal(['#type: value is not a string'])
    })
  })

  describe('#toJSON', () => {
    context('w/ a Schema', () => {
      after(() => {
        TestModel = null
      })

      before(async () => {
        TestModel = await new Model(await new Schema(TestSchema))
      })

      it('should return the JSON representation of the Model', async () => {
        const model = await new TestModel({ test: 'object', [SEQUENCE]: 1 })
        const json = model.toJSON()

        expect(json.data).to.deep.equal({ test: 'object' })
        expect(json.meta.model).to.equal('TestModel')
        expect(json.meta.schema).to.equal('https://hiveframework.io/api/v1/models/TestModel')
        expect(json.meta.sequence).to.equal(1)
      })
    })

    context('w/ DefaultSchema', () => {
      after(() => {
        TestModel = null
      })

      before(async () => {
        TestModel = await new Model()
      })

      it('should return the JSON representation of the Model', async () => {
        const model = await new TestModel({ id: 'object' })
        const json = model.toJSON()

        expect(json.data).to.deep.equal({ id: 'object' })
        expect(json.meta.model).to.equal('DefaultModel')
        expect(json.meta.schema).to.equal('https://hiveframework.io/api/v1/models/DefaultModel')
      })
    })
  })
})

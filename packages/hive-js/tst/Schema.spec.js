/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'

import Schema from '../src/Schema'

chai.use(dirtyChai)

describe('Schema class', () => {
  let schema

  describe('#constructor', () => {
    const idSchema = new Schema()
    const schemas = [
      undefined,
            { id: { type: Number, required: true } },
            { id: String, itemRef: idSchema },
            { id: String, data: [Number] },
            { id: { type: String, required: true }, data: [idSchema] },
            { id: { type: String, required: true }, counts: [Number] }
    ]

    beforeEach(() => {
      schema = new Schema(schemas.shift())
    })

    it('should create a Schema object successfully using defaults', () => {
      expect(schema).to.exist()

      expect(schema.validate).to.be.a('function')
      expect(schema.evalProperty).to.be.a('function')

      expect(schema.id).to.equal(String)
    })

    it('should create a Schema object successfully using a more complex property', () => {
      expect(schema.id.type).to.equal(Number)
      expect(schema.id.required).to.be.true()
    })

    it('should create a Schema object successfully using another Schema as a property', () => {
      expect(schema.id).to.equal(String)
      expect(schema.itemRef).to.be.an.instanceof(Schema)
      expect(schema.itemRef.id).to.equal(String)
    })

    it('should create a Schema object successfully using a property defined as an Array', () => {
      expect(schema.id).to.equal(String)
      expect(schema.data).to.be.an.instanceof(Array)
      expect(schema.data[0]).to.equal(Number)
    })

    it('should create a Schema object successfully using a more complex property and another as an Array of Schemas', () => {
      expect(schema.id.type).to.equal(String)
      expect(schema.id.required).to.be.true()
      expect(schema.data).to.be.an.instanceof(Array)
      expect(schema.data[0]).to.be.an.instanceof(Schema)
    })

    it('should create a Schema object successfully using a more complex property and another as a "typed" Array', () => {
      expect(schema.id.type).to.equal(String)
      expect(schema.id.required).to.be.true()
      expect(schema.counts).to.be.an.instanceof(Array)
      expect(schema.counts[0]).to.be.equal(Number)
    })

    afterEach(() => {
      schema = null
    })
  })

  describe('#validate', () => {
    const schemas = [
      undefined,
            { id: { type: String } },
            { id: { type: String, required: true } },
            { id: { type: String, required: true } },
            { id: { type: String, validate: () => true } },
            { id: { type: String, validate: sinon.stub().throws('Error') } },
            { id: Date }
    ]
    const data = [
      'id',
      'id',
      'id',
      undefined,
      'id',
      'id',
      'id'
    ]

    beforeEach(() => {
      schema = new Schema(schemas.shift())
    })

    it('should run without error for default type assertion', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.not.throw(/Error/)
    })

    it('should run without error for type property definition', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.not.throw(/Error/)
    })

    it('should run without error for required value', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.not.throw(/Error/)
    })

    it('should throw error for required value', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.throw(ReferenceError)
    })

    it('should run without error for assigned custom validate function', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.not.throw(/Error/)
    })

    it('should throw error for assigned custom validate function', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.throw(Error)
    })

    it('should throw error for an unsupported data type', () => {
      expect(() => schema.validate(data.shift(), schema.id)).to.throw(TypeError)
    })

    afterEach(() => {
      schema = null
    })
  })

  describe('#evalProperty', () => {
    const values = [ () => 'function', 'value' ]
    let result

    beforeEach(() => {
      schema = new Schema()

      result = schema.evalProperty(values.shift())
    })

    it('should call the function passed', () => {
      expect(result).to.be.a('string')
      expect(result).to.equal('function')
    })

    it('should return the value passed', () => {
      expect(result).to.be.a('string')
      expect(result).to.equal('value')
    })

    afterEach(() => {
      schema = null
      result = null
    })
  })
})

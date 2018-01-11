/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import Model from '../src/Model'
import Schema from '../src/Schema'

chai.use(dirtyChai)

describe('Model class', () => {
  let model

  describe('#constructor', () => {
    const schemas = [
      new Schema(),
      new Schema(),
      new Schema({ id: { type: String, default: 'stub' } }),
      new Schema({ id: { type: String, default: 'stub' } }),
      new Schema({ id: { type: String, value: 'stub' } }),
      new Schema({ id: String, itemRef: new Schema() }),
      new Schema({ id: String, meta: new Schema({ created: { type: Number, default: Date.now } }) }),
      new Schema({ id: String, availableRefs: [new Schema()] }),
      new Schema({ id: String, counts: [Number] })
    ]
    const data = [
            { id: 'id' },
            { id: 0 },
            { id: 'id' },
            {},
            { id: 'id' },
            { id: 'id', itemRef: { id: 'id' } },
            { id: 'id' },
            { id: 'id', availableRefs: [{ id: 'id1' }, { id: 'id2' }] },
            { id: 'id', counts: [1, 2, 3, 4] }
    ]

    it('should return the test object unmodified', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.update).to.be.a('function')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')
    })

    it('should throw a TypeError', () => {
      expect(() => new Model(data.shift(), schemas.shift())).to.throw(TypeError)
    })

    it('should return the test object with the provided value', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')
    })

    it('should return the test object with the default from the schema', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('stub')
    })

    it('should return the test object with the value from the schema', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('stub')
    })

    it('should return the test object with the provided nested model data', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      expect(model.itemRef.id).to.be.a('string')
      expect(model.itemRef.id).to.equal('id')
    })

    it('should return the test object with the complex nested object literal', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      expect(model.meta.created).to.be.a('number')
    })

    it('should return the test object with a nested array of schemas', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      expect(model.availableRefs[0].id).to.be.a('string')
      expect(model.availableRefs[0].id).to.equal('id1')

      expect(model.availableRefs[1].id).to.be.a('string')
      expect(model.availableRefs[1].id).to.equal('id2')
    })

    it('should return the test object with a nested array of values', () => {
      model = new Model(data.shift(), schemas.shift())

      expect(model).to.be.an('object')

      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      expect(model.counts[0]).to.be.a('number')
      expect(model.counts[0]).to.equal(1)

      expect(model.counts[1]).to.be.a('number')
      expect(model.counts[1]).to.equal(2)

      expect(model.counts[2]).to.be.a('number')
      expect(model.counts[2]).to.equal(3)

      expect(model.counts[3]).to.be.a('number')
      expect(model.counts[3]).to.equal(4)
    })

    afterEach(() => {
      model = null
    })
  })

  describe('#update', () => {
    const schemas = [
      new Schema(),
      new Schema({ id: { type: String, default: 'stub' } }),
      new Schema({ id: { type: String, value: 'stub' } }),
      new Schema({ id: new Schema() }),
      new Schema({ id: String, meta: new Schema({ updated: { type: Number, default: Date.now } }) }),
      new Schema({ id: String, availableRefs: [new Schema()] }),
      new Schema({ id: String, counts: [Number] })
    ]
    const data = [
            { id: 'id' },
            { id: 'id' },
            { id: 'id' },
            { id: { id: 'id' } },
            { id: 'id' },
            { id: 'id', availableRefs: [{ id: 'id1' }, { id: 'id2' }] },
            { id: 'id', counts: [1, 2] }
    ]
    const update = [
            { id: 'update' },
            { id: 'update' },
            { id: 'update' },
            { id: { id: 'update' } },
            { id: 'update', meta: { updated: Date.now() } },
            { id: 'update', availableRefs: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }] },
            { id: 'update', counts: [1, 2, 3, 4] }
    ]

    beforeEach(() => {
      model = new Model(data.shift(), schemas.shift())
    })

    it('should return the updated test object', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('update')
    })

    it('should return the test object unmodified even with a default value defined', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('update')
    })

    it('should return the test object with the provided value', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('stub')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('stub')
    })

    it('should return the test object with the provided nested model data', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.an('object')
      expect(model.id.id).to.be.a('string')
      expect(model.id.id).to.equal('id')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.an('object')
      expect(model.id.id).to.be.a('string')
      expect(model.id.id).to.equal('update')
    })

    it('should return the test object with the provided nested model meta data', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')
      expect(model.meta.updated).to.be.a('number')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('update')
      expect(model.meta.updated).to.be.a('number')
    })

    it('should return the test object with the provided nested model array data', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')
      expect(model.availableRefs[0].id).to.be.a('string')
      expect(model.availableRefs[0].id).to.equal('id1')
      expect(model.availableRefs[1].id).to.be.a('string')
      expect(model.availableRefs[1].id).to.equal('id2')

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('update')
      expect(model.availableRefs[0].id).to.be.a('string')
      expect(model.availableRefs[0].id).to.equal('id1')
      expect(model.availableRefs[1].id).to.be.a('string')
      expect(model.availableRefs[1].id).to.equal('id2')
      expect(model.availableRefs[2].id).to.be.a('string')
      expect(model.availableRefs[2].id).to.equal('id3')
    })

    it('should return the test object with a nested array of values', () => {
      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('id')
      expect(model.counts[0]).to.be.a('number')
      expect(model.counts[0]).to.equal(1)
      expect(model.counts[1]).to.be.a('number')
      expect(model.counts[1]).to.equal(2)

      model.update(update.shift())

      expect(model).to.be.an('object')
      expect(model.id).to.be.a('string')
      expect(model.id).to.equal('update')
      expect(model.counts[0]).to.be.a('number')
      expect(model.counts[0]).to.equal(1)
      expect(model.counts[1]).to.be.a('number')
      expect(model.counts[1]).to.equal(2)
      expect(model.counts[2]).to.be.a('number')
      expect(model.counts[2]).to.equal(3)
      expect(model.counts[3]).to.be.a('number')
      expect(model.counts[3]).to.equal(4)
    })

    afterEach(() => {
      model = null
    })
  })

  describe('#toJSON', () => {
    it('should return the JSON representation of the Model', () => {
      const model = new Model()

      expect(model.toJSON()).to.deep.equal({id: 'id', name: 'Model'})
    })
  })
})

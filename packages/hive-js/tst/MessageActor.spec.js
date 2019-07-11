/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import { Model, Schema } from 'model-json-js'

import { Actor, MessageActor } from '../src/Actor'
import { parse } from '../src/util'

// schemas
import TestSchema from './schemas/TestSchema.json'

import CreateTestSchema from './schemas/CreateTestSchema.json'
import CreatedTestSchema from './schemas/CreatedTestSchema.json'

import ViewTestSchema from './schemas/ViewTestSchema.json'
import ViewedTestSchema from './schemas/ViewedTestSchema.json'

// constants
const createData = {
  type: 'CreateTest',
  payload: { id: '1' }
}
const createdData = {
  type: 'CreatedTest',
  payload: { id: '1', view: 0 }
}
const viewData = { type: 'ViewTest' }

chai.use(dirtyChai)

// tests
describe('class MessageActor', () => {
  let testActor, createTestActor, viewTestActor,
    testSchema, createTestSchema, createdTestSchema, viewTestSchema, viewedTestSchema

  after(() => {
    testActor = null
    createTestActor = null
    viewTestActor = null
    testSchema = null
    createTestSchema = null
    createdTestSchema = null
    viewTestSchema = null
    viewedTestSchema = null
  })

  before(async () => {
    testSchema = await new Schema(TestSchema)

    createTestSchema = await new Schema(CreateTestSchema)
    createdTestSchema = await new Schema(CreatedTestSchema)

    viewTestSchema = await new Schema(ViewTestSchema)
    viewedTestSchema = await new Schema(ViewedTestSchema)

    createTestActor = new MessageActor(parse`/test`, testSchema, createdTestSchema, createTestSchema)
    viewTestActor = new MessageActor(parse`/view`, testSchema, viewedTestSchema, viewTestSchema)

    class TestActor extends Actor {
      async perform (modelInstance, data) {
        switch (data.type) {
          case 'CreateTest':
            if (data.payload) data.payload.view = 0
            else data.payload = { view: 0 }
          case 'CreatedTest': { // eslint-disable-line no-fallthrough
            return createTestActor.perform(modelInstance, data)
          }
          case 'ViewTest':
          case 'ViewedTest': {
            const { command, event, model } = await viewTestActor.perform(modelInstance, data)
            model.view++
            return { command, event, model }
          }

          default:
            return super.perform(modelInstance, data)
        }
      }
    }
    testActor = new TestActor(parse`/view`, testSchema)
  })

  describe('#constructor', () => {
    it('should create a MessageActor', () => {
      expect(createTestActor).to.be.an.instanceof(MessageActor)
      expect(createTestActor.perform).to.be.a('function')
      expect(createTestActor.replay).to.be.a('function')
      expect(createTestActor.assign).to.be.a('function')
      expect(createTestActor.parse).to.be.a('function')
    })

    it('should create a MessageActor with only an EventSchema defined', () => {
      const eventActor = new MessageActor(parse`/view`, testSchema, createdTestSchema)
      expect(eventActor).to.be.an.instanceof(MessageActor)
    })

    it('should throw an error if MessageActor isn\'t passed an event schema', () => {
      try {
        new MessageActor(parse`/view`, testSchema) // eslint-disable-line
      } catch (e) {
        expect(e.message).to.equal('#MessageActor: event schema must be a Schema')
      }
    })
  })

  describe('#perform', () => {
    it('should update, validate, and return the command, event, and model', async () => {
      const replayed = await testActor.replay({ type: 'Test', payload: { id: '1', view: 1 } })
      const { command, event, model } = await testActor.perform(replayed.model, viewData)

      expect(command).to.be.an.instanceof(Model)
      expect(command).to.deep.equal({})

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({})

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ id: '1', view: 2 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should create, validate, and return a new command, event, and model', async () => {
      const { command, event, model } = await testActor.perform(undefined, createData)

      expect(command).to.be.an.instanceof(Model)
      expect(command).to.deep.equal({ id: '1', view: 0 })

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({ id: '1', view: 0 })

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ id: '1', view: 0 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should create, validate, and return the event and model', async () => {
      const { command, event, model } = await testActor.perform(undefined, createdData)

      expect(command).to.be.undefined()

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({ id: '1', view: 0 })

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ id: '1', view: 0 })
    })

    it('should create, validate, and return the command and event', async () => {
      const test = new MessageActor(parse`/test`, undefined, createdTestSchema, createTestSchema)
      const { command, event, model } = await test.perform(undefined, createData)

      expect(command).to.be.an.instanceof(Model)
      expect(command).to.deep.equal({ id: '1', view: 0 })

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({ id: '1', view: 0 })

      expect(model).to.be.undefined()
    })
  })

  describe('#assign', () => {
    it('should assign versioned data to a model', async () => {
      const initModel = await new Model({ type: 'CreateTest', payload: { id: 'id' }, meta: { version: 1 } }, createTestSchema)
      const model = createTestActor.assign(initModel, { view: 1 }, { version: 2 })

      expect(model).to.deep.equal({ id: 'id', view: 1 })
      expect(Model.version(model)).to.equal(2)
    })

    it('should ignore the empty meta and assign the data as usual', () => {
      const model = createTestActor.assign({}, { view: 1 })

      expect(model).to.deep.equal({ view: 1 })
    })

    it('should throw and error for trying to assign out-of-sequence versioned data to a model', async () => {
      try {
        const model = await new Model({ type: 'ViewTest', meta: { version: 2 } }, viewTestSchema)
        viewTestActor.assign(model, undefined, { version: 2 })
        throw new Error('we shouldn\'t make it here')
      } catch (e) {
        expect(e.message).to.equal('data out of sequence')
      }
    })
  })
})

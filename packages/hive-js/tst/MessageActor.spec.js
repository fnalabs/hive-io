/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import Schema from 'schema-json-js'

import Model from '../src/Model'
import { VERSION } from '../src/Model/BaseModel'

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
  meta: {
    schema: 'https://hiveframework.io/api/v1/commands/CreateTest'
  }
}
const createdData = {
  type: 'CreatedTest',
  meta: {
    schema: 'https://hiveframework.io/api/v1/events/CreatedTest'
  }
}
const viewData = {
  type: 'ViewTest',
  meta: {
    schema: 'https://hiveframework.io/api/v1/commands/ViewTest'
  }
}
const meta = {
  schema: 'https://hiveframework.io/api/v1/models/Test'
}

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

    createTestActor = new MessageActor(parse`/view`, testSchema, createdTestSchema, createTestSchema)
    viewTestActor = new MessageActor(parse`/view`, testSchema, viewedTestSchema, viewTestSchema)

    class TestActor extends Actor {
      async perform (data, modelInstance, repository) {
        switch (data.type) {
          case 'CreateTest':
          case 'CreatedTest': {
            modelInstance = await new Model({ type: 'Test', payload: { view: 0 } }, testSchema)
            const { command, event, model } = await createTestActor.perform(data, modelInstance, repository)
            return { command, event, model }
          }
          case 'ViewTest':
          case 'ViewedTest': {
            const { command, event, model } = await viewTestActor.perform(data, modelInstance, repository)
            model.view++
            return { command, event, model }
          }
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
    it('should create, validate, and return the command, event, and model', async () => {
      const replayedModel = await testActor.replay({ type: 'Test', payload: { view: 1 }, meta })
      const { command, event, model } = await testActor.perform(viewData, replayedModel)

      expect(command).to.be.an.instanceof(Model)
      expect(command).to.deep.equal({})

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({})

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 2 })
      expect(await Model.validate(model)).to.be.true()
    })

    it('should create, validate, and return the event and model', async () => {
      const { command, event, model } = await testActor.perform(createdData)

      expect(command).to.equal(null)

      expect(event).to.be.an.instanceof(Model)
      expect(event).to.deep.equal({})

      expect(model).to.be.an.instanceof(Model)
      expect(model).to.deep.equal({ view: 0 })
    })
  })

  describe('#assign', () => {
    it('should assign versioned data to a model', () => {
      const model = createTestActor.assign({[VERSION]: 1}, { view: 1 }, { ...createData.meta, version: 2 })

      expect(model).to.deep.equal({ view: 1 })
      expect(model[VERSION]).to.equal(2)
    })

    it('should ignore the empty meta and assign the data as usual', () => {
      const model = createTestActor.assign({}, { view: 1 })

      expect(model).to.deep.equal({ view: 1 })
    })

    it('should throw and error for trying to assign out-of-sequence versioned data to a model', () => {
      try {
        viewTestActor.assign({[VERSION]: 2}, { view: 1 }, { ...viewData.meta, version: 2 })
      } catch (e) {
        expect(e.message).to.equal('data out of sequence')
      }
    })
  })
})

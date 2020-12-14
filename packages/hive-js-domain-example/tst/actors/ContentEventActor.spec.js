/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor } from 'hive-io'

chai.use(dirtyChai)

// constants
const createdData = {
  type: 'CreatedContent',
  payload: { text: 'something', id: '1' },
  meta: { version: 1 }
}
const disabledData = {
  type: 'DisabledContent',
  payload: { id: '1' },
  meta: { version: 2 }
}
const editedData = {
  type: 'EditedContent',
  payload: { text: 'something else', id: '1' },
  meta: { version: 3 }
}
const enabledData = {
  type: 'EnabledContent',
  payload: { id: '1' },
  meta: { version: 4 }
}
const viewData = {
  type: 'ViewedContent',
  payload: { id: '1' }
}

// tests
describe('ContentEventActor', () => {
  let model, ContentEventActor, contentEventActor, modelMock, repositorySpy

  afterEach(() => {
    modelMock = null
    repositorySpy = null

    ContentEventActor = null
    contentEventActor = null
  })

  describe('#constructor', () => {
    beforeEach(async () => {
      repositorySpy = sinon.spy()
      ContentEventActor = proxyquire('../../src/actors/content/ContentEventActor', {
        '../../util/mongoConnect': async () => { return { model: repositorySpy } }
      })
    })

    it('should create a ContentEventActor successfully', async () => {
      contentEventActor = await new ContentEventActor()

      expect(repositorySpy.calledOnce).to.be.true()

      expect(contentEventActor).to.be.an.instanceof(Actor)
      expect(contentEventActor.perform).to.be.a('function')
      expect(contentEventActor.replay).to.be.a('function')
      expect(contentEventActor.assign).to.be.a('function')
    })
  })

  describe('#perform', () => {
    beforeEach(async () => {
      modelMock = {
        findOneAndUpdate: sinon.stub().returnsThis(),
        exec: sinon.spy()
      }
      repositorySpy = sinon.spy()
      ContentEventActor = proxyquire('../../src/actors/content/ContentEventActor', {
        '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } }
      })
      contentEventActor = await new ContentEventActor()
    })

    it('should perform CreatedContent successfully', async () => {
      await contentEventActor.perform(model, createdData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform DisabledContent successfully', async () => {
      await contentEventActor.perform(model, disabledData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform EditedContent successfully', async () => {
      await contentEventActor.perform(model, editedData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform EnabledContent successfully', async () => {
      await contentEventActor.perform(model, enabledData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform View successfully', async () => {
      await contentEventActor.perform(model, viewData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      const data1 = {
        type: 'Something',
        payload: { id: 'id' }
      }
      try {
        await contentEventActor.perform(model, data1)
      } catch (e) {
        expect(e.message).to.equal('Event not recognized')
      }
    })
  })
})

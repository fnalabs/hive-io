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
describe('PostEventActor', () => {
  let model, PostEventActor, postEventActor, emitSpy, modelMock, repositorySpy

  afterEach(() => {
    emitSpy = null
    modelMock = null
    repositorySpy = null

    PostEventActor = null
    postEventActor = null
  })

  describe('#constructor', () => {
    beforeEach(async () => {
      emitSpy = sinon.spy()
      repositorySpy = sinon.spy()
      PostEventActor = proxyquire('../../src/actors/post/PostEventActor', {
        '../../util/mongoConnect': async () => { return { model: repositorySpy } },
        '../../systems/LogSystem': new Proxy(Object, {
          construct: async function (Object) {
            return { emit: () => emitSpy() }
          }
        })
      })
    })

    it('should create a PostEventActor successfully', async () => {
      postEventActor = await new PostEventActor()

      expect(repositorySpy.calledOnce).to.be.true()

      expect(postEventActor).to.be.an.instanceof(Actor)
      expect(postEventActor.perform).to.be.a('function')
      expect(postEventActor.replay).to.be.a('function')
      expect(postEventActor.assign).to.be.a('function')
      expect(emitSpy.called).to.be.false()
    })
  })

  describe('#perform', () => {
    beforeEach(async () => {
      emitSpy = sinon.spy()
      modelMock = {
        findOneAndUpdate: sinon.stub().returnsThis(),
        exec: sinon.spy()
      }
      repositorySpy = sinon.spy()
      PostEventActor = proxyquire('../../src/actors/post/PostEventActor', {
        '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } },
        '../../systems/LogSystem': new Proxy(Object, {
          construct: async function (Object) {
            return { emit: () => emitSpy() }
          }
        })
      })
      postEventActor = await new PostEventActor()
    })

    it('should perform CreatedContent successfully', async () => {
      await postEventActor.perform(model, createdData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
      expect(emitSpy.calledOnce).to.be.true()
    })

    it('should perform DisabledContent successfully', async () => {
      await postEventActor.perform(model, disabledData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
      expect(emitSpy.calledOnce).to.be.true()
    })

    it('should perform EditedContent successfully', async () => {
      await postEventActor.perform(model, editedData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
      expect(emitSpy.calledOnce).to.be.true()
    })

    it('should perform EnabledContent successfully', async () => {
      await postEventActor.perform(model, enabledData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
      expect(emitSpy.calledOnce).to.be.true()
    })

    it('should perform View successfully', async () => {
      await postEventActor.perform(model, viewData)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
      expect(emitSpy.calledOnce).to.be.true()
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      const data1 = {
        type: 'Something',
        payload: { id: 'id' }
      }
      try {
        await postEventActor.perform(model, data1)
      } catch (e) {
        expect(e.message).to.equal('Event not recognized')
      }
    })
  })
})

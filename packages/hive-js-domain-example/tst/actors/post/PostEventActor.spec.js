/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'
import { Actor } from 'hive-io'

import PostEventActor from '../../../src/actors/post/PostEventActor'

chai.use(dirtyChai)

// constants
const createdPayload = {
  data: { text: 'something', id: { id: '1' } },
  meta: { model: 'CreatedContent', version: 1, id: '1' }
}
const disabledPayload = {
  meta: { model: 'DisabledContent', version: 2, id: '1' }
}
const editedPayload = {
  data: { text: 'something else' },
  meta: { model: 'EditedContent', version: 3, id: '1' }
}
const enabledPayload = {
  meta: { model: 'EnabledContent', version: 4, id: '1' }
}
const viewPayload = {
  data: { id: { id: 'something' } },
  meta: { model: 'View' }
}

// tests
describe('PostEventActor', () => {
  let postEventActor, modelMock

  afterEach(() => {
    modelMock = null
    postEventActor = null
  })

  describe('#constructor', () => {
    beforeEach(async () => {
      postEventActor = await new PostEventActor({})
    })

    it('should create a PostEventActor successfully', () => {
      expect(postEventActor).to.be.an.instanceof(Actor)
      expect(postEventActor.perform).to.be.a('function')
      expect(postEventActor.replay).to.be.a('function')
      expect(postEventActor.assign).to.be.a('function')
      expect(postEventActor.parse).to.be.a('function')
    })
  })

  describe('#perform', () => {
    beforeEach(async () => {
      modelMock = {
        findOneAndUpdate: sinon.stub().returnsThis(),
        exec: sinon.spy()
      }
      postEventActor = await new PostEventActor(modelMock)
    })

    it('should perform CreatedContent successfully', async () => {
      await postEventActor.perform(createdPayload)

      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform DisabledContent successfully', async () => {
      await postEventActor.perform(disabledPayload)

      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform EditedContent successfully', async () => {
      await postEventActor.perform(editedPayload)

      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform EnabledContent successfully', async () => {
      await postEventActor.perform(enabledPayload)

      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform View successfully', async () => {
      await postEventActor.perform(viewPayload)

      expect(modelMock.findOneAndUpdate.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      const payload1 = {
        meta: { model: 'Something', id: '1' }
      }
      try {
        await postEventActor.perform(payload1)
      } catch (e) {
        expect(e.message).to.equal('Command|Event not recognized')
      }
    })
  })
})

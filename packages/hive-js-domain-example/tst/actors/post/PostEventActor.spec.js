/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { isUUID } from 'validator'
import { Actor, Model } from 'hive-io'

import PostEventActor from '../../../src/actors/post/PostEventActor'

chai.use(dirtyChai)

// constants
const createdPayload = {
  data: { text: 'something' },
  meta: { model: 'CreatedContent', version: 0 }
}
const disabledPayload = {
  meta: { model: 'DisabledContent', version: 1 }
}
const editedPayload = {
  data: { text: 'something else' },
  meta: { model: 'EditedContent', version: 2 }
}
const enabledPayload = {
  meta: { model: 'EnabledContent', version: 3 }
}
const viewPayload = {
  data: { id: { id: 'something' } },
  meta: { model: 'View' }
}

// tests
describe('PostEventActor', () => {
  let postEventActor

  after(() => {
    postEventActor = null
  })

  before(async () => {
    postEventActor = await new PostEventActor()
  })

  describe('#constructor', () => {
    it('should create a PostEventActor successfully', () => {
      expect(postEventActor).to.be.an.instanceof(Actor)
      expect(postEventActor.perform).to.be.a('function')
      expect(postEventActor.replay).to.be.a('function')
      expect(postEventActor.assign).to.be.a('function')
      expect(postEventActor.parse).to.be.a('function')
    })
  })

  describe('#perform', () => {
    context('CreatedContent event', () => {
      it('should perform successfully', async () => {
        const { model } = await postEventActor.perform(createdPayload)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.true()
        expect(model.viewed).to.equal(0)
      })

      it('should throw an error for invalid data', async () => {
        const payload1 = {
          data: { text: null },
          meta: { model: 'CreatedContent' }
        }
        try {
          await postEventActor.perform(payload1)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        const payload2 = {
          data: {
            id: { id: 1 },
            text: 'something'
          },
          meta: { model: 'CreatedContent' }
        }
        try {
          await postEventActor.perform(payload2)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })
    })

    context('DisabledContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await postEventActor.replay([createdPayload])
        const { model } = await postEventActor.perform(disabledPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.false()
        expect(model.viewed).to.equal(0)
      })

      it('should throw an error for content already disabled', async () => {
        const modelInstance = await postEventActor.replay([createdPayload, disabledPayload])

        try {
          await postEventActor.perform(disabledPayload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#DisabledContent: content already disabled')
        }
      })
    })

    context('EditedContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await postEventActor.replay([createdPayload, disabledPayload])
        const { model } = await postEventActor.perform(editedPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.false()
        expect(model.viewed).to.equal(0)
      })

      it('should throw an error for invalid data', async () => {
        const payload = {
          data: { text: null },
          meta: { model: 'EditedContent' }
        }
        const modelInstance = await postEventActor.replay([createdPayload, disabledPayload])

        try {
          await postEventActor.perform(payload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })
    })

    context('EnabledContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await postEventActor.replay([createdPayload, disabledPayload, editedPayload])
        const { model } = await postEventActor.perform(enabledPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.true()
        expect(model.viewed).to.equal(0)
      })

      it('should throw an error for content already enabled', async () => {
        const modelInstance = await postEventActor.replay([createdPayload, disabledPayload, editedPayload, enabledPayload])

        try {
          await postEventActor.perform(enabledPayload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#EnabledContent: content already enabled')
        }
      })
    })

    context('View message', () => {
      it('should perform successfully', async () => {
        const modelInstance = await postEventActor.replay([createdPayload])
        const { model } = await postEventActor.perform(viewPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.true()
        expect(model.viewed).to.equal(1)
      })

      it('should throw an error for invalid data', async () => {
        const payload = {
          data: { id: { id: 1 } },
          meta: { model: 'View' }
        }
        try {
          await postEventActor.perform(payload)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      const payload1 = {
        meta: { model: 'Something' }
      }
      try {
        await postEventActor.perform(payload1)
      } catch (e) {
        expect(e.message).to.equal('Command|Event not recognized')
      }
    })
  })

  describe('#replay', () => {
    it('should throw an error if passed an event out of sequence', async () => {
      try {
        await postEventActor.replay([createdPayload, editedPayload])
      } catch (e) {
        expect(e.message).to.equal('EditedContent out of sequence')
      }
    })
  })
})

/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { isUUID } from 'validator'
import { Actor, Model } from 'hive-io'

import ContentActor from '../../../src/actors/content/ContentActor'

chai.use(dirtyChai)

// constants
const createPayload = {
  data: { text: 'something' },
  meta: { model: 'CreateContent', urlParams: {} }
}
const createdPayload = {
  data: { text: 'something', id: { id: '1' } },
  meta: { model: 'CreatedContent', version: 1, id: '1' }
}
const disablePayload = {
  meta: { model: 'DisableContent', version: 1, urlParams: { contentId: '1' } }
}
const disabledPayload = {
  meta: { model: 'DisabledContent', version: 2, id: '1' }
}
const editPayload = {
  data: { text: 'something else' },
  meta: { model: 'EditContent', version: 2, urlParams: { contentId: '1' } }
}
const editedPayload = {
  data: { text: 'something else' },
  meta: { model: 'EditedContent', version: 3, id: '1' }
}
const enablePayload = {
  meta: { model: 'EnableContent', version: 3, urlParams: { contentId: '1' } }
}
const enabledPayload = {
  meta: { model: 'EnabledContent', version: 4, id: '1' }
}

// tests
describe('ContentActor', () => {
  let contentActor

  after(() => {
    contentActor = null
  })

  before(async () => {
    contentActor = await new ContentActor()
  })

  describe('#constructor', () => {
    it('should create a ContentActor successfully', () => {
      expect(contentActor).to.be.an.instanceof(Actor)
      expect(contentActor.perform).to.be.a('function')
      expect(contentActor.replay).to.be.a('function')
      expect(contentActor.assign).to.be.a('function')
      expect(contentActor.parse).to.be.a('function')
    })
  })

  describe('#perform', () => {
    context('CreateContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await contentActor.replay(createPayload)
        const { model } = await contentActor.perform(createPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.true()
      })

      it('should throw an error for invalid data', async () => {
        const payload1 = {
          data: { text: null },
          meta: { model: 'CreateContent' }
        }
        try {
          await contentActor.perform(payload1)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        const payload2 = {
          data: {
            id: { id: 1 },
            text: 'something'
          },
          meta: { model: 'CreateContent' }
        }
        try {
          await contentActor.perform(payload2)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })

      it('should throw an error if model already exists', async () => {
        try {
          await contentActor.perform(createPayload, { id: { id: 'something' } })
        } catch (e) {
          expect(e.message).to.equal('#CreateContent: something already exists')
        }
      })
    })

    context('DisableContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await contentActor.replay(disablePayload, { get () { return [createdPayload] } })
        const { model } = await contentActor.perform(disablePayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.false()
      })

      it('should throw an error for content already disabled', async () => {
        const modelInstance = await contentActor.replay(disablePayload, { get () { return [createdPayload, disabledPayload] } })

        try {
          await contentActor.perform(disablePayload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#DisableContent: content already disabled')
        }
      })
    })

    context('EditContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await contentActor.replay(editPayload, { get () { return [createdPayload, disabledPayload] } })
        const { model } = await contentActor.perform(editPayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.false()
      })

      it('should throw an error for invalid data', async () => {
        const payload = {
          data: { text: null },
          meta: { model: 'EditContent', urlParams: { contentId: 1 } }
        }
        const modelInstance = await contentActor.replay(payload, { get () { return [createdPayload, disabledPayload] } })

        try {
          await contentActor.perform(payload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })
    })

    context('EnableContent event', () => {
      it('should perform successfully', async () => {
        const modelInstance = await contentActor.replay(enablePayload, { get () { return [createdPayload, disabledPayload, editedPayload] } })
        const { model } = await contentActor.perform(enablePayload, modelInstance)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.true()
      })

      it('should throw an error for content already enabled', async () => {
        const modelInstance = await contentActor.replay(enablePayload, { get () { return [createdPayload, disabledPayload, editedPayload, enabledPayload] } })

        try {
          await contentActor.perform(enablePayload, modelInstance)
        } catch (e) {
          expect(e.message).to.equal('#EnableContent: content already enabled')
        }
      })
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      const payload1 = {
        meta: { model: 'Something' }
      }
      try {
        await contentActor.perform(payload1)
      } catch (e) {
        expect(e.message).to.equal('Command|Event not recognized')
      }
    })
  })

  describe('#replay', () => {
    it('should throw an error if passed an event out of sequence', async () => {
      try {
        await contentActor.replay(editPayload, { get () { return [createdPayload, editedPayload] } })
      } catch (e) {
        expect(e.message).to.equal('EditedContent out of sequence')
      }
    })
  })
})

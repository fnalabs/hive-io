/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { isUUID } from 'validator'
import { Actor, Model } from 'hive-io'

import ContentCommandActor from '../../src/actors/content/ContentCommandActor'

chai.use(dirtyChai)

// constants
const createData = {
  payload: { text: 'something' },
  meta: { request: { params: {}, method: 'POST' } }
}
const createdData = {
  type: 'CreatedContent',
  payload: { text: 'something', id: '1' }
}
const disableData = {
  meta: { request: { params: { id: '1' }, method: 'DELETE' } }
}
const disabledData = {
  type: 'DisabledContent',
  payload: { id: '1' }
}
const editData = {
  payload: { text: 'something else' },
  meta: { request: { params: { id: '1' }, method: 'PATCH' } }
}
const editedData = {
  type: 'EditedContent',
  payload: { text: 'something else', id: '1' }
}
const enableData = {
  meta: { request: { params: { id: '1' }, method: 'PATCH' } }
}
const enabledData = {
  type: 'EnabledContent',
  payload: { id: '1' }
}

// tests
describe('ContentCommandActor', () => {
  let contentCommandActor

  afterEach(() => {
    contentCommandActor = null
  })

  describe('#constructor', () => {
    it('should create a ContentCommandActor successfully', async () => {
      contentCommandActor = await new ContentCommandActor()

      expect(contentCommandActor).to.be.an.instanceof(Actor)
      expect(contentCommandActor.perform).to.be.a('function')
      expect(contentCommandActor.replay).to.be.a('function')
      expect(contentCommandActor.assign).to.be.a('function')
    })
  })

  describe('#perform', () => {
    context('CreateContent command', () => {
      it('should perform successfully', async () => {
        contentCommandActor = await new ContentCommandActor()

        const { model } = await contentCommandActor.perform(undefined, createData)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.true()
      })

      it('should throw an error for invalid data', async () => {
        contentCommandActor = await new ContentCommandActor()

        const data1 = {
          payload: { text: null },
          meta: { request: { params: {}, method: 'POST' } }
        }
        try {
          await contentCommandActor.perform(undefined, data1)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        const data2 = {
          payload: { id: 1, text: 'something' },
          meta: { request: { params: {}, method: 'POST' } }
        }
        try {
          await contentCommandActor.perform(undefined, data2)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })

      it('should throw an error if model already exists', async () => {
        contentCommandActor = await new ContentCommandActor()

        try {
          await contentCommandActor.perform({ id: '1' }, createData)
        } catch (e) {
          expect(e.message).to.equal('#CreateContent: 1 already exists')
        }
      })
    })

    context('DisableContent command', () => {
      it('should perform successfully from snapshot', async () => {
        const snapshot = { type: 'Content', payload: { id: '1', text: 'something', enabled: true, edited: false } }

        contentCommandActor = await new ContentCommandActor()

        const replayed = await contentCommandActor.replay(snapshot)
        const { model } = await contentCommandActor.perform(replayed.model, disableData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.false()
      })

      it('should throw an error for content already disabled', async () => {
        contentCommandActor = await new ContentCommandActor()

        const { model } = await contentCommandActor.replay([createdData, disabledData])

        try {
          await contentCommandActor.perform(model, disableData)
        } catch (e) {
          expect(e.message).to.equal('#DisableContent: content already disabled')
        }
      })
    })

    context('EditContent command', () => {
      it('should perform successfully', async () => {
        contentCommandActor = await new ContentCommandActor()

        const replayed = await contentCommandActor.replay([createdData, disabledData])
        const { model } = await contentCommandActor.perform(replayed.model, editData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.false()
      })

      it('should throw an error for invalid data', async () => {
        contentCommandActor = await new ContentCommandActor()

        const data = {
          payload: { text: null },
          meta: { request: { params: { id: 1 }, method: 'PATCH' } }
        }
        const { model } = await contentCommandActor.replay([createdData, disabledData])

        try {
          await contentCommandActor.perform(model, data)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })

      it('should throw an error for undefined model', async () => {
        contentCommandActor = await new ContentCommandActor()

        try {
          await contentCommandActor.perform(undefined, editData)
        } catch (e) {
          expect(e.message).to.equal('#EditContent: 1 doesn\'t exist')
        }
      })
    })

    context('EnableContent command', () => {
      it('should perform successfully', async () => {
        contentCommandActor = await new ContentCommandActor()

        const replayed = await contentCommandActor.replay([createdData, disabledData, editedData])
        const { model } = await contentCommandActor.perform(replayed.model, enableData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.true()
      })

      it('should throw an error for content already enabled', async () => {
        contentCommandActor = await new ContentCommandActor()

        const { model } = await contentCommandActor.replay([createdData, disabledData, editedData, enabledData])

        try {
          await contentCommandActor.perform(model, enableData)
        } catch (e) {
          expect(e.message).to.equal('#EnableContent: content already enabled')
        }
      })
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      contentCommandActor = await new ContentCommandActor()

      const data1 = { type: 'Something' }
      try {
        await contentCommandActor.perform(undefined, data1)
      } catch (e) {
        expect(e.message).to.equal('Command|Event not recognized')
      }
    })
  })
})

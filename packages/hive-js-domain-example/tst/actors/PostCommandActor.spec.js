/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { isUUID } from 'validator'
import { Actor, Model } from 'hive-io'

chai.use(dirtyChai)

// constants
const createData = {
  payload: { text: 'something' },
  meta: { req: { urlParams: {}, method: 'POST' } }
}
const createdData = {
  type: 'CreatedContent',
  payload: { text: 'something', id: '1' }
}
const disableData = {
  meta: { req: { urlParams: { id: '1' }, method: 'DELETE' } }
}
const disabledData = {
  type: 'DisabledContent',
  payload: { id: '1' }
}
const editData = {
  payload: { text: 'something else' },
  meta: { req: { urlParams: { id: '1' }, method: 'PATCH' } }
}
const editedData = {
  type: 'EditedContent',
  payload: { text: 'something else', id: '1' }
}
const enableData = {
  meta: { req: { urlParams: { id: '1' }, method: 'PATCH' } }
}
const enabledData = {
  type: 'EnabledContent',
  payload: { id: '1' }
}

// tests
describe('PostCommandActor', () => {
  let PostCommandActor, postCommandActor, emitSpy

  afterEach(() => {
    emitSpy = null

    PostCommandActor = null
    postCommandActor = null
  })

  beforeEach(() => {
    emitSpy = sinon.spy()
    PostCommandActor = proxyquire('../../src/actors/post/PostCommandActor', {
      '../../systems/LogSystem': new Proxy(Object, {
        construct: async function (Object) {
          return { emit: () => emitSpy() }
        }
      })
    })
  })

  describe('#constructor', () => {
    it('should create a PostCommandActor successfully', async () => {
      postCommandActor = await new PostCommandActor()

      expect(postCommandActor).to.be.an.instanceof(Actor)
      expect(postCommandActor.perform).to.be.a('function')
      expect(postCommandActor.replay).to.be.a('function')
      expect(postCommandActor.assign).to.be.a('function')
      expect(postCommandActor.parse).to.be.a('function')

      expect(emitSpy.called).to.be.false()
    })
  })

  describe('#perform', () => {
    context('CreateContent command', () => {
      it('should perform successfully', async () => {
        postCommandActor = await new PostCommandActor()

        const { model } = await postCommandActor.perform(undefined, createData)

        expect(model).to.be.an.instanceof(Model)
        expect(isUUID(model.id)).to.be.true()
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.true()
        expect(emitSpy.calledOnce).to.be.true()
      })

      it('should throw an error for invalid data', async () => {
        postCommandActor = await new PostCommandActor()

        const data1 = {
          payload: { text: null },
          meta: { req: { urlParams: {}, method: 'POST' } }
        }
        try {
          await postCommandActor.perform(undefined, data1)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }

        const data2 = {
          payload: { id: 1, text: 'something' },
          meta: { req: { urlParams: {}, method: 'POST' } }
        }
        try {
          await postCommandActor.perform(undefined, data2)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })

      it('should throw an error if model already exists', async () => {
        postCommandActor = await new PostCommandActor()

        try {
          await postCommandActor.perform({ id: '1' }, createData)
        } catch (e) {
          expect(e.message).to.equal('#CreateContent: 1 already exists')
        }
      })
    })

    context('DisableContent command', () => {
      it('should perform successfully from snapshot', async () => {
        const snapshot = { type: 'Post', payload: { id: '1', text: 'something', enabled: true, edited: false } }

        postCommandActor = await new PostCommandActor()

        const replayed = await postCommandActor.replay(snapshot)
        const { model } = await postCommandActor.perform(replayed.model, disableData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something')
        expect(model.edited).to.be.false()
        expect(model.enabled).to.be.false()
        expect(emitSpy.called).to.be.true()
      })

      it('should throw an error for content already disabled', async () => {
        postCommandActor = await new PostCommandActor()

        const { model } = await postCommandActor.replay([createdData, disabledData])

        try {
          await postCommandActor.perform(model, disableData)
        } catch (e) {
          expect(e.message).to.equal('#DisableContent: content already disabled')
        }
      })
    })

    context('EditContent command', () => {
      it('should perform successfully', async () => {
        postCommandActor = await new PostCommandActor()

        const replayed = await postCommandActor.replay([createdData, disabledData])
        const { model } = await postCommandActor.perform(replayed.model, editData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.false()
        expect(emitSpy.called).to.be.true()
      })

      it('should throw an error for invalid data', async () => {
        postCommandActor = await new PostCommandActor()

        const data = {
          payload: { text: null },
          meta: { req: { urlParams: { id: 1 }, method: 'PATCH' } }
        }
        const { model } = await postCommandActor.replay([createdData, disabledData])

        try {
          await postCommandActor.perform(model, data)
        } catch (e) {
          expect(e.message).to.equal('#type: value is not a string')
        }
      })

      it('should throw an error for undefined model', async () => {
        postCommandActor = await new PostCommandActor()

        try {
          await postCommandActor.perform(undefined, editData)
        } catch (e) {
          expect(e.message).to.equal('#EditContent: 1 doesn\'t exist')
        }
      })
    })

    context('EnableContent command', () => {
      it('should perform successfully', async () => {
        postCommandActor = await new PostCommandActor()

        const replayed = await postCommandActor.replay([createdData, disabledData, editedData])
        const { model } = await postCommandActor.perform(replayed.model, enableData)

        expect(model).to.be.an.instanceof(Model)
        expect(model.text).to.equal('something else')
        expect(model.edited).to.be.true()
        expect(model.enabled).to.be.true()
        expect(emitSpy.called).to.be.true()
      })

      it('should throw an error for content already enabled', async () => {
        postCommandActor = await new PostCommandActor()

        const { model } = await postCommandActor.replay([createdData, disabledData, editedData, enabledData])

        try {
          await postCommandActor.perform(model, enableData)
        } catch (e) {
          expect(e.message).to.equal('#EnableContent: content already enabled')
        }
      })
    })

    it('should throw an error if passed a message it doesn\'t understand', async () => {
      postCommandActor = await new PostCommandActor()

      const data1 = { type: 'Something' }
      try {
        await postCommandActor.perform(undefined, data1)
      } catch (e) {
        expect(e.message).to.equal('Command|Event not recognized')
      }
    })
  })
})

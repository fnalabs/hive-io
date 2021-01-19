/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'

chai.use(dirtyChai)
proxyquire.noCallThru()

// constants
const getAll = { meta: { request: { method: 'GET', params: {} } } }
const getOne = { meta: { request: { method: 'GET', params: { id: '1' } } } }
const postError = { meta: { request: { method: 'POST' } } }

// tests
describe('ContentQueryActor', () => {
  let model, ContentQueryActor, contentQueryActor, modelMock, repositorySpy

  describe('successes', () => {
    afterEach(() => {
      modelMock = null
      repositorySpy = null

      ContentQueryActor = null
      contentQueryActor = null
    })

    beforeEach(async () => {
      modelMock = {
        find: stub().returnsThis(),
        findOne: stub().returnsThis(),
        exec: spy()
      }
      repositorySpy = spy()
      ContentQueryActor = proxyquire('../../src/actors/content/ContentQueryActor', {
        '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } },
        '../../systems/LogSystem': class System {
          on () { spy() }
          emit () { spy() }
        }
      })
      contentQueryActor = await new ContentQueryActor()
    })

    it('should perform a get all contents request successfully', async () => {
      await contentQueryActor.perform(model, getAll)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.find.calledOnce).to.be.true()
      expect(modelMock.findOne.called).to.be.false()
      expect(modelMock.exec.calledOnce).to.be.true()
    })

    it('should perform a get single content request successfully', async () => {
      await contentQueryActor.perform(model, getOne)

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.find.called).to.be.false()
      expect(modelMock.findOne.calledOnce).to.be.true()
      expect(modelMock.exec.calledOnce).to.be.true()
    })
  })

  describe('errors', () => {
    afterEach(() => {
      modelMock = null
      repositorySpy = null

      ContentQueryActor = null
      contentQueryActor = null
    })

    beforeEach(async () => {
      modelMock = {
        find: stub().returnsThis(),
        findOne: stub().returnsThis(),
        exec: stub().throws(new Error('exec error'))
      }
      repositorySpy = spy()
      ContentQueryActor = proxyquire('../../src/actors/content/ContentQueryActor', {
        '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } },
        '../../systems/LogSystem': class System {
          on () { spy() }
          emit () { spy() }
        }
      })
      contentQueryActor = await new ContentQueryActor()
    })

    it('should thrown an error on a get all contents request successfully', async () => {
      try {
        await contentQueryActor.perform(model, getAll)
      } catch (error) {
        expect(repositorySpy.calledOnce).to.be.true()
        expect(modelMock.find.calledOnce).to.be.true()
        expect(modelMock.findOne.called).to.be.false()
        expect(modelMock.exec.calledOnce).to.be.true()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should thrown an error on a get single content request successfully', async () => {
      try {
        await contentQueryActor.perform(model, getOne)
      } catch (error) {
        expect(repositorySpy.calledOnce).to.be.true()
        expect(modelMock.find.called).to.be.false()
        expect(modelMock.findOne.calledOnce).to.be.true()
        expect(modelMock.exec.calledOnce).to.be.true()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should throw an error if HTTP method is anything other than GET', async () => {
      try {
        await contentQueryActor.perform(model, postError)
      } catch (e) {
        expect(e.message).to.equal('Content values can only be queried from this endpoint')

        expect(repositorySpy.calledOnce).to.be.true()
        expect(modelMock.find.called).to.be.false()
        expect(modelMock.findOne.called).to.be.false()
        expect(modelMock.exec.called).to.be.false()
      }
    })
  })
})

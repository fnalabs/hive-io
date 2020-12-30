/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import { spy, stub } from 'sinon'

chai.use(dirtyChai)

// constants
const getData = { meta: { request: { url: '/content/1', params: { id: '1' }, method: 'GET' } } }
const getAllData = { meta: { request: { url: '/content', params: { id: undefined }, method: 'GET' } } }
const postData = { type: 'Content', payload: { text: 'something' }, meta: { request: { url: '/content/1', params: { id: '1' }, method: 'POST' } } }
const putData = { type: 'Content', payload: { text: 'something else' }, meta: { request: { url: '/content/1', params: { id: '1' }, method: 'PATCH' } } }
const deleteData = { meta: { request: { url: '/content', params: { id: '1' }, method: 'DELETE' } } }

// tests
describe('ContentActor', () => {
  let model, ContentActor, contentActor, execSpy, saveSpy, findSpy, findOneAndUpdateSpy, repositoryStub

  describe('successes', () => {
    afterEach(() => {
      ContentActor = null
      contentActor = null

      execSpy = null
      saveSpy = null
      findSpy = null
      findOneAndUpdateSpy = null
      repositoryStub = null
    })

    beforeEach(async () => {
      execSpy = spy()
      saveSpy = spy()
      findSpy = spy()
      findOneAndUpdateSpy = spy()
      repositoryStub = stub().returns({
        model: () => {
          return class TestModel {
            async save () { saveSpy() }

            static async exec () { execSpy() }

            static find () { findSpy(); return TestModel }

            static findOneAndUpdate () { findOneAndUpdateSpy(); return TestModel }
          }
        }
      })

      ContentActor = proxyquire('../../src/actors/ContentActor', {
        '../util/mongoConnect': () => repositoryStub()
      })
      contentActor = await new ContentActor()
    })

    it('should process a GET request successfully', async () => {
      await contentActor.perform(model, getData)

      expect(execSpy.calledOnce).to.be.true()
      expect(saveSpy.called).to.be.false()
      expect(findSpy.called).to.be.false()
      expect(findOneAndUpdateSpy.calledOnce).to.be.true()
    })

    it('should process a GET all request successfully', async () => {
      await contentActor.perform(model, getAllData)

      expect(execSpy.calledOnce).to.be.true()
      expect(saveSpy.called).to.be.false()
      expect(findSpy.calledOnce).to.be.true()
      expect(findOneAndUpdateSpy.called).to.be.false()
    })

    it('should process a POST request successfully', async () => {
      await contentActor.perform(model, postData)

      expect(execSpy.called).to.be.false()
      expect(saveSpy.calledOnce).to.be.true()
      expect(findSpy.called).to.be.false()
      expect(findOneAndUpdateSpy.called).to.be.false()
    })

    it('should process a PUT request successfully', async () => {
      await contentActor.perform(model, putData)

      expect(execSpy.calledOnce).to.be.true()
      expect(saveSpy.called).to.be.false()
      expect(findSpy.called).to.be.false()
      expect(findOneAndUpdateSpy.calledOnce).to.be.true()
    })

    it('should process a DELETE request successfully', async () => {
      await contentActor.perform(model, deleteData)

      expect(execSpy.calledOnce).to.be.true()
      expect(saveSpy.called).to.be.false()
      expect(findSpy.called).to.be.false()
      expect(findOneAndUpdateSpy.calledOnce).to.be.true()
    })
  })

  describe('errors', () => {
    afterEach(() => {
      ContentActor = null
      contentActor = null

      execSpy = null
      saveSpy = null
      findSpy = null
      findOneAndUpdateSpy = null
      repositoryStub = null
    })

    beforeEach(async () => {
      execSpy = stub().throws(new Error('exec error'))
      saveSpy = stub().throws(new Error('save error'))
      findSpy = spy()
      findOneAndUpdateSpy = spy()
      repositoryStub = stub().returns({
        model: () => {
          return class TestModel {
            async save () { saveSpy() }

            static async exec () { execSpy() }

            static find () { findSpy(); return TestModel }

            static findOneAndUpdate () { findOneAndUpdateSpy(); return TestModel }
          }
        }
      })

      ContentActor = proxyquire('../../src/actors/ContentActor', {
        '../util/mongoConnect': () => repositoryStub()
      })
      contentActor = await new ContentActor()
    })

    it('should throw an error on a GET request successfully', async () => {
      try {
        await contentActor.perform(model, getData)
      } catch (error) {
        expect(execSpy.calledOnce).to.be.true()
        expect(saveSpy.called).to.be.false()
        expect(findSpy.called).to.be.false()
        expect(findOneAndUpdateSpy.calledOnce).to.be.true()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should throw an error on a GET all request successfully', async () => {
      try {
        await contentActor.perform(model, getAllData)
      } catch (error) {
        expect(execSpy.calledOnce).to.be.true()
        expect(saveSpy.called).to.be.false()
        expect(findSpy.calledOnce).to.be.true()
        expect(findOneAndUpdateSpy.called).to.be.false()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should throw an error on a POST request successfully', async () => {
      try {
        await contentActor.perform(model, postData)
      } catch (error) {
        expect(execSpy.called).to.be.false()
        expect(saveSpy.calledOnce).to.be.true()
        expect(findSpy.called).to.be.false()
        expect(findOneAndUpdateSpy.called).to.be.false()

        expect(error.message).to.equal('save error')
      }
    })

    it('should throw an error on a PUT request successfully', async () => {
      try {
        await contentActor.perform(model, putData)
      } catch (error) {
        expect(execSpy.calledOnce).to.be.true()
        expect(saveSpy.called).to.be.false()
        expect(findSpy.called).to.be.false()
        expect(findOneAndUpdateSpy.calledOnce).to.be.true()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should throw an error on a DELETE request successfully', async () => {
      try {
        await contentActor.perform(model, deleteData)
      } catch (error) {
        expect(execSpy.calledOnce).to.be.true()
        expect(saveSpy.called).to.be.false()
        expect(findSpy.called).to.be.false()
        expect(findOneAndUpdateSpy.calledOnce).to.be.true()

        expect(error.message).to.equal('exec error')
      }
    })

    it('should throw an error for any other HTTP verbs', async () => {
      try {
        await contentActor.perform(model, { meta: { request: { url: '/content', method: 'PUT' } } })
      } catch (e) {
        expect(e.message).to.equal('HTTP verb not supported')
      }
    })
  })
})

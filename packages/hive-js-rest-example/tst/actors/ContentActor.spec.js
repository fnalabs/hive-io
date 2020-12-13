/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
// import { isUUID } from 'validator'
import { Actor } from 'hive-io'

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
    execSpy = sinon.spy()
    saveSpy = sinon.spy()
    findSpy = sinon.spy()
    findOneAndUpdateSpy = sinon.spy()
    repositoryStub = sinon.stub().returns({
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

  it('should create a ContentActor successfully', () => {
    expect(contentActor).to.be.an.instanceof(Actor)
    expect(contentActor.perform).to.be.a('function')
    expect(contentActor.replay).to.be.a('function')
    expect(contentActor.assign).to.be.a('function')
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

  it('should throw an error for any other HTTP verbs', async () => {
    try {
      await contentActor.perform(model, { meta: { request: { url: '/content', method: 'PUT' } } })
    } catch (e) {
      expect(e.message).to.equal('HTTP verb not supported')
    }
  })
})

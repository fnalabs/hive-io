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
const getPayload = { meta: { urlParams: { postId: '1' }, method: 'GET' } }
const getAllPayload = { meta: { urlParams: { postId: undefined }, method: 'GET' } }
const postPayload = { data: { text: 'something' }, meta: { urlParams: { postId: '1' }, method: 'POST' } }
const putPayload = { data: { text: 'something else' }, meta: { urlParams: { postId: '1' }, method: 'PUT' } }
const deletePayload = { meta: { urlParams: { postId: '1' }, method: 'DELETE' } }

// tests
describe('PostActor', () => {
  let PostActor, postActor, execSpy, saveSpy, findSpy, findOneAndUpdateSpy, repositoryStub

  afterEach(() => {
    PostActor = null
    postActor = null

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

    PostActor = proxyquire('../../src/actors/PostActor', {
      '../util/mongoConnect': () => repositoryStub()
    })
    postActor = await new PostActor()
  })

  it('should create a PostActor successfully', () => {
    expect(postActor).to.be.an.instanceof(Actor)
    expect(postActor.perform).to.be.a('function')
    expect(postActor.replay).to.be.a('function')
    expect(postActor.assign).to.be.a('function')
    expect(postActor.parse).to.be.a('function')
  })

  it('should process a GET request successfully', async () => {
    await postActor.perform(getPayload)

    expect(execSpy.calledOnce).to.be.true()
    expect(saveSpy.called).to.be.false()
    expect(findSpy.called).to.be.false()
    expect(findOneAndUpdateSpy.calledOnce).to.be.true()
  })

  it('should process a GET all request successfully', async () => {
    await postActor.perform(getAllPayload)

    expect(execSpy.calledOnce).to.be.true()
    expect(saveSpy.called).to.be.false()
    expect(findSpy.calledOnce).to.be.true()
    expect(findOneAndUpdateSpy.called).to.be.false()
  })

  it('should process a POST request successfully', async () => {
    await postActor.perform(postPayload)

    expect(execSpy.called).to.be.false()
    expect(saveSpy.calledOnce).to.be.true()
    expect(findSpy.called).to.be.false()
    expect(findOneAndUpdateSpy.called).to.be.false()
  })

  it('should process a PUT request successfully', async () => {
    await postActor.perform(putPayload)

    expect(execSpy.calledOnce).to.be.true()
    expect(saveSpy.called).to.be.false()
    expect(findSpy.called).to.be.false()
    expect(findOneAndUpdateSpy.calledOnce).to.be.true()
  })

  it('should process a DELETE request successfully', async () => {
    await postActor.perform(deletePayload)

    expect(execSpy.calledOnce).to.be.true()
    expect(saveSpy.called).to.be.false()
    expect(findSpy.called).to.be.false()
    expect(findOneAndUpdateSpy.calledOnce).to.be.true()
  })

  it('should throw an error for any other HTTP verbs', async () => {
    try {
      await postActor.perform({ meta: { method: 'STEVE' } })
    } catch (e) {
      expect(e.message).to.equal('HTTP verb not supported')
    }
  })
})

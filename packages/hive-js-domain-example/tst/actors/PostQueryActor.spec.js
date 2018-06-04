/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor } from 'hive-io'

chai.use(dirtyChai)

// constants
const getAll = { meta: { method: 'GET', urlParams: {} } }
const getOne = { meta: { method: 'GET', urlParams: { postId: '1' } } }
const postError = { meta: { method: 'POST' } }

// tests
describe('PostQueryActor', () => {
  let model, PostQueryActor, postQueryActor, emitSpy, modelMock, repositorySpy

  afterEach(() => {
    emitSpy = null
    modelMock = null
    repositorySpy = null

    PostQueryActor = null
    postQueryActor = null
  })

  beforeEach(async () => {
    emitSpy = sinon.spy()
    modelMock = {
      find: sinon.stub().returnsThis(),
      findOne: sinon.stub().returnsThis(),
      exec: sinon.spy()
    }
    repositorySpy = sinon.spy()
    PostQueryActor = proxyquire('../../src/actors/post/PostQueryActor', {
      '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } },
      '../../systems/LogSystem': new Proxy(Object, {
        construct: async function (Object) {
          return { emit: () => emitSpy() }
        }
      })
    })
    postQueryActor = await new PostQueryActor()
  })

  it('should create a PostQueryActor successfully', () => {
    expect(repositorySpy.calledOnce).to.be.true()
    expect(modelMock.find.called).to.be.false()
    expect(modelMock.findOne.called).to.be.false()
    expect(modelMock.exec.called).to.be.false()
    expect(emitSpy.called).to.be.false()

    expect(postQueryActor).to.be.an.instanceof(Actor)
    expect(postQueryActor.perform).to.be.a('function')
    expect(postQueryActor.replay).to.be.a('function')
    expect(postQueryActor.assign).to.be.a('function')
    expect(postQueryActor.parse).to.be.a('function')
  })

  it('should perform a get all posts request successfully', async () => {
    await postQueryActor.perform(model, getAll)

    expect(repositorySpy.calledOnce).to.be.true()
    expect(modelMock.find.calledOnce).to.be.true()
    expect(modelMock.findOne.called).to.be.false()
    expect(modelMock.exec.calledOnce).to.be.true()
    expect(emitSpy.calledOnce).to.be.true()
  })

  it('should perform a get single post request successfully', async () => {
    await postQueryActor.perform(model, getOne)

    expect(repositorySpy.calledOnce).to.be.true()
    expect(modelMock.find.called).to.be.false()
    expect(modelMock.findOne.calledOnce).to.be.true()
    expect(modelMock.exec.calledOnce).to.be.true()
    expect(emitSpy.calledOnce).to.be.true()
  })

  it('should throw an error if HTTP method is anything other than GET', async () => {
    try {
      await postQueryActor.perform(model, postError)
    } catch (e) {
      expect(e.message).to.equal('Post values can only be queried from this endpoint')

      expect(repositorySpy.calledOnce).to.be.true()
      expect(modelMock.find.called).to.be.false()
      expect(modelMock.findOne.called).to.be.false()
      expect(modelMock.exec.called).to.be.false()
      expect(emitSpy.called).to.be.false()
    }
  })
})

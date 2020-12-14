/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Actor } from 'hive-io'

chai.use(dirtyChai)

// constants
const getAll = { meta: { request: { method: 'GET', params: {} } } }
const getOne = { meta: { request: { method: 'GET', params: { id: '1' } } } }
const postError = { meta: { request: { method: 'POST' } } }

// tests
describe('ContentQueryActor', () => {
  let model, ContentQueryActor, contentQueryActor, modelMock, repositorySpy

  afterEach(() => {
    modelMock = null
    repositorySpy = null

    ContentQueryActor = null
    contentQueryActor = null
  })

  beforeEach(async () => {
    modelMock = {
      find: sinon.stub().returnsThis(),
      findOne: sinon.stub().returnsThis(),
      exec: sinon.spy()
    }
    repositorySpy = sinon.spy()
    ContentQueryActor = proxyquire('../../src/actors/content/ContentQueryActor', {
      '../../util/mongoConnect': async () => { return { model () { repositorySpy(); return modelMock } } }
    })
    contentQueryActor = await new ContentQueryActor()
  })

  it('should create a ContentQueryActor successfully', () => {
    expect(repositorySpy.calledOnce).to.be.true()
    expect(modelMock.find.called).to.be.false()
    expect(modelMock.findOne.called).to.be.false()
    expect(modelMock.exec.called).to.be.false()

    expect(contentQueryActor).to.be.an.instanceof(Actor)
    expect(contentQueryActor.perform).to.be.a('function')
    expect(contentQueryActor.replay).to.be.a('function')
    expect(contentQueryActor.assign).to.be.a('function')
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

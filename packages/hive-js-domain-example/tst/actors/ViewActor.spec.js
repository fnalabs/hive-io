/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { Actor, Model } from 'hive-io'

import ViewActor from '../../src/actors/ViewActor'

chai.use(dirtyChai)

// tests
describe('ViewActor', () => {
  let viewActor

  after(() => {
    viewActor = null
  })

  before(async () => {
    viewActor = await new ViewActor()
  })

  it('should create a ViewActor successfully', () => {
    expect(viewActor).to.be.an.instanceof(Actor)
    expect(viewActor.perform).to.be.a('function')
    expect(viewActor.replay).to.be.a('function')
    expect(viewActor.assign).to.be.a('function')
    expect(viewActor.parse).to.be.a('function')
  })

  it('should process a View payload successfully', async () => {
    const payload = {
      data: { id: { id: 'something' } },
      meta: { model: 'View' }
    }
    const { model } = await viewActor.perform(payload)

    expect(model).to.be.an.instanceof(Model)
    expect(model).to.deep.equal({ id: { id: 'something' } })
  })

  it('should throw an error on an invalid View payload', async () => {
    const payload = {
      data: { id: { id: 1 } },
      meta: { model: 'View' }
    }

    try {
      await viewActor.perform(payload)
    } catch (e) {
      expect(e.message).to.equal('#type: value is not a string')
    }
  })
})

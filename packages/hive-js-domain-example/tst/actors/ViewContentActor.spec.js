/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { Actor, Model } from 'hive-io'

import ViewContentActor from '../../src/actors/messages/ViewContentActor'

chai.use(dirtyChai)

// tests
describe('ViewContentActor', () => {
  let viewContentActor

  afterEach(() => {
    viewContentActor = null
  })

  beforeEach(async () => {
    viewContentActor = await new ViewContentActor()
  })

  it('should create a ViewContentActor successfully', () => {
    expect(viewContentActor).to.be.an.instanceof(Actor)
    expect(viewContentActor.perform).to.be.a('function')
    expect(viewContentActor.replay).to.be.a('function')
    expect(viewContentActor.assign).to.be.a('function')
    expect(viewContentActor.parse).to.be.a('function')
  })

  it('should process a View data successfully', async () => {
    const data = { meta: { req: { urlParams: { id: '1' } } } }
    const { event } = await viewContentActor.perform(undefined, data)

    expect(event).to.be.an.instanceof(Model)
    expect(event).to.deep.equal({ id: '1' })
  })
})

/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

import micro from 'micro'

chai.use(chaiHttp)
chai.use(dirtyChai)

describe('app', () => {
  let app, parseStub, performStub, urlStub

  describe('#routes', () => {
    let performStubs = [
      sinon.stub().returns({}),
      sinon.stub().returns({}),
      sinon.stub().throws(Error),
      sinon.stub().returns({})
    ]

    afterEach(() => {
      app = null
      parseStub = null
      performStub = null
      urlStub = null
    })

    beforeEach(async () => {
      parseStub = sinon.stub().returns({})
      performStub = performStubs.shift()
      urlStub = sinon.stub().returns({})

      const main = proxyquire('../src/', {
        'kafka-node': {
          ViewActor: class Actor {
            perform () { return performStub() }
            parse () { return parseStub() }
          }
        },
        'url': { parse () { return urlStub() } },
        './store': class Store {}
      })
      app = await main({ ACTOR_LIB: 'kafka-node', ACTOR: 'ViewActor' }, micro)
    })

    it('should respond with 200 from /ping', done => {
      chai.request(app)
        .get('/ping')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()
          expect(urlStub.called).to.be.false()

          done()
        })
    })

    it('should respond with 200 from /test on successful GET', done => {
      chai.request(app)
        .get('/test')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(urlStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 400 from /test on unsuccessful GET', done => {
      chai.request(app)
        .get('/test')
        .end((err, res) => {
          expect(err).to.not.be.null()
          expect(res).to.have.status(400)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(urlStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 405 from /test on unsuccessful POST', done => {
      chai.request(app)
        .post('/test/1')
        .send({meta: {}})
        .end((err, res) => {
          expect(err).to.not.be.null()
          expect(res).to.have.status(405)

          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()
          expect(urlStub.called).to.be.false()

          done()
        })
    })
  })
})

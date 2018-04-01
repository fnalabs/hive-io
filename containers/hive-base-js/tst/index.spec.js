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
      sinon.stub().returns({}),
      sinon.stub().throws(Error)
    ]

    afterEach(() => {
      app = null
      parseStub = null
      performStub = null
      urlStub = null
    })

    beforeEach(async () => {
      performStub = performStubs.shift()
      parseStub = sinon.stub().returns({})
      urlStub = sinon.stub().returns({})

      const main = proxyquire('../src/', {
        'archiver': {
          PostActor: class Actor {
            perform () { return performStub() }
            parse () { return parseStub() }
          }
        },
        'url': { parse () { return urlStub() } }
      })
      app = await main({ ACTOR_LIB: 'archiver', ACTOR: 'PostActor' }, micro)
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

    it('should respond with 200 from /test on successful get', done => {
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

    it('should respond with 200 from /test on successful post', done => {
      chai.request(app)
        .post('/test')
        .send({meta: {}})
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(urlStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 400 from /test on unsuccessful post', done => {
      chai.request(app)
        .post('/test')
        .send({meta: {}})
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(400)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(urlStub.calledOnce).to.be.true()

          done()
        })
    })
  })
})

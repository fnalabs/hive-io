/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

import http from 'http'

chai.use(chaiHttp)
chai.use(dirtyChai)

describe('app', () => {
  let app, route, parseStub, performStub

  describe('#routes', () => {
    const performStubs = [
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().returns({ model: {} }),
      sinon.stub().throws(Error)
    ]

    afterEach(() => {
      app = null
      route = null

      parseStub = null
      performStub = null
    })

    beforeEach(async () => {
      performStub = performStubs.shift()
      parseStub = sinon.stub().returns({})

      const main = proxyquire('../src/', {
        './config': {
          ACTOR_LIB: 'codecov',
          ACTOR: 'PostActor',
          PING_URL: '/ping',
          CONTENT_TYPE: 'application/json'
        },
        codecov: {
          PostActor: class Actor {
            perform () { return performStub() }

            parse () { return parseStub() }
          }
        }
      }).default
      route = await main()
      app = http.createServer(route)
    })

    it('should respond with 200 from /ping', done => {
      chai.request(app)
        .get('/ping')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()

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

          done()
        })
    })

    it('should respond with 200 from /test on successful post with payload', done => {
      chai.request(app)
        .post('/test')
        .send({ payload: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful post with meta', done => {
      chai.request(app)
        .post('/test')
        .send({ meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful post with short-circuit data payload', done => {
      chai.request(app)
        .post('/test')
        .send({ some: 'thing' })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful post with serialized model payload', done => {
      chai.request(app)
        .post('/test')
        .send({ type: 'Test', payload: {}, meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful post with duplicate headers as an Array', done => {
      chai.request(app)
        .post('/test')
        .set('set-cookie', 'test1')
        .set('set-cookie', 'test2')
        .send({ type: 'Test', payload: {}, meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 400 from /test on unsuccessful post', done => {
      chai.request(app)
        .post('/test')
        .send({ meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(400)

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })
  })
})

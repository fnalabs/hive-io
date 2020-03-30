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
  let app, route, recordStub, parseStub, performStub, produceSpy

  describe('#routes', () => {
    const recordStubs = [
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub().throws(Error),
      sinon.stub()
    ]

    afterEach(() => {
      app = null
      route = null

      recordStub = null
      parseStub = null
      performStub = null
      produceSpy = null
    })

    beforeEach(async () => {
      recordStub = recordStubs.shift()
      parseStub = sinon.stub().returns({})
      performStub = sinon.stub().returns({})
      produceSpy = sinon.spy()

      const main = proxyquire('../src/', {
        './config': {
          ACTOR_LIB: 'kafkajs',
          ACTOR: 'ViewActor',
          PING_URL: '/ping',
          CONTENT_TYPE: 'application/json'
        },
        kafkajs: {
          ViewActor: class MessageActor {
            perform () { return performStub() }
            parse () { return parseStub() }
          }
        },
        './store': class Store {
          produce () { produceSpy() }
          record () { recordStub() }
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

          expect(recordStub.called).to.be.false()
          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful POST with payload', done => {
      chai.request(app)
        .post('/test')
        .send({ payload: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful POST with meta', done => {
      chai.request(app)
        .post('/test')
        .send({ meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful POST with short-circuit payload', done => {
      chai.request(app)
        .post('/test')
        .send({ some: 'thing' })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful DELETE with no payload', done => {
      chai.request(app)
        .delete('/test')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

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

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

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

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 400 from /test on unsuccessful POST', done => {
      chai.request(app)
        .post('/test')
        .send({ meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(400)

          expect(recordStub.calledOnce).to.be.true()
          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 405 from /test on unsuccessful GET', done => {
      chai.request(app)
        .get('/test/1')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(405)

          expect(recordStub.called).to.be.false()
          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()
          expect(produceSpy.calledOnce).to.be.true()

          done()
        })
    })
  })
})

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
  describe('#routes', () => {
    let app, route, constructorSpy, consumeSpy, parseStub, performStub
    const performStubs = [
      sinon.stub().returns({}),
      sinon.stub().returns({}),
      sinon.stub().returns({}),
      sinon.stub().throws(Error),
      sinon.stub().returns({})
    ]

    afterEach(() => {
      app = null
      route = null

      constructorSpy = null
      consumeSpy = null
      parseStub = null
      performStub = null
    })

    beforeEach(async () => {
      constructorSpy = sinon.spy()
      consumeSpy = sinon.spy()
      parseStub = sinon.stub().returns({})
      performStub = performStubs.shift()

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
          constructor () { constructorSpy() }
          consume () { consumeSpy() }
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

          expect(constructorSpy.calledOnce).to.be.true()
          expect(consumeSpy.calledOnce).to.be.true()

          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()

          done()
        })
    })

    it('should respond with 200 from /test on successful GET', done => {
      chai.request(app)
        .get('/test')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(constructorSpy.calledOnce).to.be.true()
          expect(consumeSpy.calledOnce).to.be.true()

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 200 from /test on successful post with duplicate headers as an Array', done => {
      chai.request(app)
        .get('/test')
        .set('set-cookie', 'test1')
        .set('set-cookie', 'test2')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(200)

          expect(constructorSpy.calledOnce).to.be.true()
          expect(consumeSpy.calledOnce).to.be.true()

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 400 from /test on unsuccessful GET', done => {
      chai.request(app)
        .get('/test')
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(400)

          expect(constructorSpy.calledOnce).to.be.true()
          expect(consumeSpy.calledOnce).to.be.true()

          expect(parseStub.calledOnce).to.be.true()
          expect(performStub.calledOnce).to.be.true()

          done()
        })
    })

    it('should respond with 405 from /test on unsuccessful POST', done => {
      chai.request(app)
        .post('/test/1')
        .send({ meta: {} })
        .end((err, res) => {
          expect(err).to.be.null()
          expect(res).to.have.status(405)

          expect(constructorSpy.calledOnce).to.be.true()
          expect(consumeSpy.calledOnce).to.be.true()

          expect(parseStub.called).to.be.false()
          expect(performStub.called).to.be.false()

          done()
        })
    })
  })

  describe('#handleConsume', () => {
    let performSpy

    after(() => {
      performSpy = null
    })

    before(async () => {
      performSpy = sinon.spy()

      const { default: main, handleConsume } = proxyquire('../src/', {
        './config': {
          ACTOR_LIB: 'kafkajs',
          ACTOR: 'ViewActor',
          PING_URL: '/ping',
          CONTENT_TYPE: 'application/json'
        },
        kafkajs: {
          ViewActor: class MessageActor {
            perform (model, data) { return performSpy(model, data) }
          }
        },
        './store': class Store {
          consume () {}
        }
      })
      await main()
      handleConsume({ message: { value: '{}' } })
    })

    it('should handle messages from Event Store successfully', () => {
      expect(performSpy.calledOnce).to.be.true()
    })
  })
})

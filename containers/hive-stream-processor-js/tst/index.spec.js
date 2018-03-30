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
  let app, observerSpy, parseStub, performStub, recordStub, replayStub, urlStub

  describe('#routes', () => {
    context('PROCESSOR_TYPE: "producer"', () => {
      let recordStubs = [
        sinon.stub(),
        sinon.stub(),
        sinon.stub().throws(Error),
        sinon.stub()
      ]

      afterEach(() => {
        app = null
        observerSpy = null
        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null
        urlStub = null
      })

      beforeEach(async () => {
        observerSpy = sinon.spy()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})
        urlStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          'node-rdkafka': {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          'url': { parse () { return urlStub() } },
          './observer': class Observer { constructor () { observerSpy() } },
          './repository': class Repository { record () { recordStub() } },
          './store': class Store {}
        })
        app = await main({ ACTOR_LIB: 'node-rdkafka', ACTOR: 'ViewActor', PROCESSOR_TYPE: 'producer' }, micro)
      })

      it('should respond with 200 from /ping', done => {
        chai.request(app)
          .get('/ping')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(200)

            expect(observerSpy.called).to.be.false()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })

      it('should respond with 200 from /test on successful POST', done => {
        chai.request(app)
          .post('/test')
          .send({meta: {}})
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(200)

            expect(observerSpy.called).to.be.false()
            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()
            expect(urlStub.calledOnce).to.be.true()

            done()
          })
      })

      it('should respond with 400 from /test on unsuccessful POST', done => {
        chai.request(app)
          .post('/test')
          .send({meta: {}})
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(400)

            expect(observerSpy.called).to.be.false()
            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()
            expect(urlStub.calledOnce).to.be.true()

            done()
          })
      })

      it('should respond with 405 from /test on unsuccessful GET', done => {
        chai.request(app)
          .get('/test/1')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(405)

            expect(observerSpy.called).to.be.false()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })
    })

    context('PROCESSOR_TYPE: "consumer"', () => {
      let recordStubs = [
        sinon.stub(),
        sinon.stub()
      ]

      afterEach(() => {
        app = null
        observerSpy = null
        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null
        urlStub = null
      })

      beforeEach(async () => {
        observerSpy = sinon.spy()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})
        urlStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          'node-rdkafka': {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          'url': { parse () { return urlStub() } },
          './observer': class Observer { constructor () { observerSpy() } },
          './repository': class Repository { record () { recordStub() } },
          './store': class Store {}
        })
        app = await main({ ACTOR_LIB: 'node-rdkafka', ACTOR: 'ViewActor', PROCESSOR_TYPE: 'consumer' }, micro)
      })

      it('should respond with 200 from /ping', done => {
        chai.request(app)
          .get('/ping')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(200)

            expect(observerSpy.calledOnce).to.be.true()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })

      it('should respond with 400 from /test on unsuccessful POST', done => {
        chai.request(app)
          .post('/test')
          .send({meta: {}})
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(400)

            expect(observerSpy.calledOnce).to.be.true()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })
    })

    context('PROCESSOR_TYPE: "stream_processor"', () => {
      let recordStubs = [
        sinon.stub(),
        sinon.stub()
      ]

      afterEach(() => {
        app = null
        observerSpy = null
        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null
        urlStub = null
      })

      beforeEach(async () => {
        observerSpy = sinon.spy()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})
        urlStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          'node-rdkafka': {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          'url': { parse () { return urlStub() } },
          './observer': class Observer { constructor () { observerSpy() } },
          './repository': class Repository { record () { recordStub() } },
          './store': class Store {}
        })
        app = await main({ ACTOR_LIB: 'node-rdkafka', ACTOR: 'ViewActor', PROCESSOR_TYPE: 'consumer' }, micro)
      })

      it('should respond with 200 from /ping', done => {
        chai.request(app)
          .get('/ping')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(200)

            expect(observerSpy.calledOnce).to.be.true()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })

      it('should respond with 400 from /test on unsuccessful POST', done => {
        chai.request(app)
          .post('/test')
          .send({meta: {}})
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(400)

            expect(observerSpy.calledOnce).to.be.true()
            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()
            expect(urlStub.called).to.be.false()

            done()
          })
      })
    })
  })
})

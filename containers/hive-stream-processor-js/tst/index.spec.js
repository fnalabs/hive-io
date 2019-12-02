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
    let app, route, constructorSpy, consumeSpy, getStub, parseStub, performStub, produceSpy, recordStub, replayStub

    context('PROCESSOR_TYPE: "producer"', () => {
      const getStubs = [
        sinon.stub(),
        sinon.stub().returns('{}'),
        sinon.stub().returns('{}'),
        sinon.stub().returns('{}'),
        sinon.stub(),
        sinon.stub().returns('{}'),
        sinon.stub().returns('{}'),
        sinon.stub(),
        sinon.stub()
      ]
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

        getStub = null
        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null

        constructorSpy = null
        consumeSpy = null
        produceSpy = null
      })

      beforeEach(async () => {
        constructorSpy = sinon.spy()
        consumeSpy = sinon.spy()
        getStub = getStubs.shift()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        produceSpy = sinon.spy()
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          '../conf/appConfig': {
            PROCESSOR_TYPE: 'producer',
            ACTOR_LIB: 'kafkajs',
            ACTOR: 'ViewActor',
            PING_URL: '/ping',
            CONTENT_TYPE: 'application/json'
          },
          kafkajs: {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          './repository': class Repository {
            get () { return getStub() }
            record () { recordStub() }
          },
          './store': class Store {
            constructor () { constructorSpy() }
            produce () { produceSpy() }
            consume (handler) { consumeSpy(handler) }
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
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()

            done()
          })
      })

      it('should respond with 200 from /test on successful DELETE with no payload', done => {
        chai.request(app)
          .delete('/test')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(200)

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.called).to.be.false()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.calledOnce).to.be.true()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.calledOnce).to.be.true()
            expect(recordStub.calledOnce).to.be.true()
            expect(replayStub.called).to.be.false()

            done()
          })
      })

      it('should respond with 405 from /test on unsuccessful GET', done => {
        chai.request(app)
          .get('/test/1')
          .end((err, res) => {
            expect(err).to.be.null()
            expect(res).to.have.status(405)

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.called).to.be.false()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

            done()
          })
      })
    })

    context('PROCESSOR_TYPE: "consumer"', () => {
      let constructorSpy, consumeSpy
      const recordStubs = [
        sinon.stub(),
        sinon.stub()
      ]

      afterEach(() => {
        app = null
        route = null

        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null

        constructorSpy = null
        consumeSpy = null
        produceSpy = null
      })

      beforeEach(async () => {
        constructorSpy = sinon.spy()
        consumeSpy = sinon.spy()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        produceSpy = sinon.spy()
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          '../conf/appConfig': {
            PROCESSOR_TYPE: 'consumer',
            ACTOR_LIB: 'kafkajs',
            ACTOR: 'ViewActor',
            PING_URL: '/ping',
            CONTENT_TYPE: 'application/json'
          },
          kafkajs: {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          './repository': class Repository { record () { recordStub() } },
          './store': class Store {
            constructor () { constructorSpy() }
            consume (handler) { consumeSpy(handler) }
            produce () { produceSpy() }
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
            expect(produceSpy.called).to.be.false()

            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.calledOnce).to.be.true()
            expect(produceSpy.called).to.be.false()

            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

            done()
          })
      })
    })

    context('PROCESSOR_TYPE: "stream_processor"', () => {
      const recordStubs = [
        sinon.stub(),
        sinon.stub()
      ]

      afterEach(() => {
        app = null
        route = null

        parseStub = null
        performStub = null
        recordStub = null
        replayStub = null

        constructorSpy = null
        consumeSpy = null
        produceSpy = null
      })

      beforeEach(async () => {
        constructorSpy = sinon.spy()
        consumeSpy = sinon.spy()
        parseStub = sinon.stub().returns({})
        performStub = sinon.stub().returns({})
        produceSpy = sinon.spy()
        recordStub = recordStubs.shift()
        replayStub = sinon.stub().returns({})

        const main = proxyquire('../src/', {
          '../conf/appConfig': {
            PROCESSOR_TYPE: 'stream_processor',
            ACTOR_LIB: 'kafkajs',
            ACTOR: 'ViewActor',
            PING_URL: '/ping',
            CONTENT_TYPE: 'application/json'
          },
          kafkajs: {
            ViewActor: class Actor {
              perform () { return performStub() }
              parse () { return parseStub() }
              replay () { return replayStub() }
            }
          },
          './repository': class Repository { record () { recordStub() } },
          './store': class Store {
            constructor () { constructorSpy() }
            consume (handler) { consumeSpy(handler) }
            produce () { produceSpy() }
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
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.called).to.be.false()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

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

            expect(constructorSpy.calledOnce).to.be.true()
            expect(consumeSpy.calledOnce).to.be.true()
            expect(produceSpy.calledOnce).to.be.true()

            expect(parseStub.calledOnce).to.be.true()
            expect(performStub.called).to.be.false()
            expect(recordStub.called).to.be.false()
            expect(replayStub.called).to.be.false()

            done()
          })
      })
    })
  })

  describe('#handleConsume', () => {
    let getStub, performStub, replayStub, recordSpy, updateSpy

    context('PROCESSOR_TYPE: "consumer"', () => {
      const getStubs = [
        sinon.stub(),
        sinon.stub().returns('{}')
      ]

      afterEach(() => {
        getStub = null
        performStub = null
        replayStub = null
        recordSpy = null
        updateSpy = null
      })

      beforeEach(async () => {
        getStub = getStubs.shift()
        performStub = sinon.stub().returns({})
        replayStub = sinon.stub().returns({ model: {} })
        recordSpy = sinon.spy()
        updateSpy = sinon.spy()

        const { default: main, handleConsume } = proxyquire('../src/', {
          '../conf/appConfig': {
            PROCESSOR_TYPE: 'consumer',
            ACTOR_LIB: 'kafkajs',
            ACTOR: 'ViewActor',
            PING_URL: '/ping',
            CONTENT_TYPE: 'application/json'
          },
          kafkajs: {
            ViewActor: class MessageActor {
              perform () { return performStub() }
              replay () { return replayStub() }
            }
          },
          './repository': class Repository {
            get () { return getStub() }
            update () { updateSpy() }
          },
          './store': class Store {
            consume () {}
            record () { recordSpy() }
          }
        })
        await main()
        await handleConsume({ message: { value: '{}' } })
      })

      it('should handle new messages from Event Store successfully', () => {
        expect(getStub.calledOnce).to.be.true()
        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
        expect(recordSpy.called).to.be.false()
        expect(updateSpy.calledOnce).to.be.true()
      })

      it('should handle messages with existing snapshots from Event Store successfully', () => {
        expect(getStub.calledOnce).to.be.true()
        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
        expect(recordSpy.called).to.be.false()
        expect(updateSpy.calledOnce).to.be.true()
      })
    })

    context('PROCESSOR_TYPE: "stream_processor"', () => {
      const getStubs = [
        sinon.stub(),
        sinon.stub().returns('{}')
      ]

      afterEach(() => {
        getStub = null
        performStub = null
        replayStub = null
        recordSpy = null
        updateSpy = null
      })

      beforeEach(async () => {
        getStub = getStubs.shift()
        performStub = sinon.stub().returns({})
        replayStub = sinon.stub().returns({ model: {} })
        recordSpy = sinon.spy()
        updateSpy = sinon.spy()

        const { default: main, handleConsume } = proxyquire('../src/', {
          '../conf/appConfig': {
            PROCESSOR_TYPE: 'stream_processor',
            ACTOR_LIB: 'kafkajs',
            ACTOR: 'ViewActor',
            PING_URL: '/ping',
            CONTENT_TYPE: 'application/json'
          },
          kafkajs: {
            ViewActor: class MessageActor {
              perform () { return performStub() }
              replay () { return replayStub() }
            }
          },
          './repository': class Repository {
            get () { return getStub() }
            update () { updateSpy() }
          },
          './store': class Store {
            consume () {}
            produce () {}
            record () { recordSpy() }
          }
        })
        await main()
        await handleConsume({ message: { value: '{}' } })
      })

      it('should handle new messages from Event Store successfully', () => {
        expect(getStub.calledOnce).to.be.true()
        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.called).to.be.false()
        expect(recordSpy.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()
      })

      it('should handle messages with existing snapshots from Event Store successfully', () => {
        expect(getStub.calledOnce).to.be.true()
        expect(performStub.calledOnce).to.be.true()
        expect(replayStub.calledOnce).to.be.true()
        expect(recordSpy.calledOnce).to.be.true()
        expect(updateSpy.called).to.be.false()
      })
    })
  })
})

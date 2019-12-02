/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('repository', () => {
  let Repository, repository

  describe('#constructor', () => {
    let redisSpy, redisOnSpy, redlockSpy, redlockOnSpy

    after(() => {
      Repository = null
      repository = null

      redisSpy = null
      redlockSpy = null
    })

    before(() => {
      redisSpy = sinon.spy()
      redisOnSpy = sinon.spy()
      redlockSpy = sinon.spy()
      redlockOnSpy = sinon.spy()

      Repository = proxyquire('../src/repository', {
        '../conf/appConfig': {
          CACHE_URL: '',
          LOCK_TTL: 1000,
          LOCK_DRIFT_FACTOR: 0.01,
          LOCK_RETRY_COUNT: 0,
          LOCK_RETRY_DELAY: 400,
          LOCK_RETRY_JITTER: 400
        },
        ioredis: class Redis {
          constructor () { redisSpy() }
          on () { redisOnSpy() }
        },
        redlock: class Redlock {
          constructor () { redlockSpy() }
          on () { redlockOnSpy() }
        }
      })
      repository = new Repository()
    })

    it('should create the Repository object', () => {
      expect(repository).to.exist()

      expect(repository.delete).to.be.a('function')
      expect(repository.get).to.be.a('function')
      expect(repository.record).to.be.a('function')
      expect(repository.update).to.be.a('function')

      expect(redisSpy.calledOnce).to.be.true()
      expect(redisOnSpy.calledOnce).to.be.true()
      expect(redlockSpy.calledOnce).to.be.true()
      expect(redlockOnSpy.calledOnce).to.be.true()
    })
  })

  describe('#delete', () => {
    let deleteSpy

    after(() => {
      Repository = null
      repository = null

      deleteSpy = null
    })

    before(() => {
      deleteSpy = sinon.spy()

      Repository = proxyquire('../src/repository', {
        '../conf/appConfig': {
          CACHE_URL: '',
          LOCK_TTL: 1000,
          LOCK_DRIFT_FACTOR: 0.01,
          LOCK_RETRY_COUNT: 0,
          LOCK_RETRY_DELAY: 400,
          LOCK_RETRY_JITTER: 400
        },
        ioredis: class Redis {
          on () {}
          del () { deleteSpy() }
        },
        redlock: class Redlock {
          on () {}
        }
      })
      repository = new Repository()
    })

    it('should call delete from redis instance', async () => {
      await repository.delete()

      expect(deleteSpy.calledOnce).to.be.true()
    })
  })

  describe('#get', () => {
    let getStub
    const getStubs = [
      sinon.stub().returns(Promise.resolve('')),
      sinon.stub().returns(Promise.resolve('{}'))
    ]

    afterEach(() => {
      Repository = null
      repository = null

      getStub = null
    })

    beforeEach(() => {
      getStub = getStubs.shift()

      Repository = proxyquire('../src/repository', {
        '../conf/appConfig': {
          CACHE_URL: '',
          LOCK_TTL: 1000,
          LOCK_DRIFT_FACTOR: 0.01,
          LOCK_RETRY_COUNT: 0,
          LOCK_RETRY_DELAY: 400,
          LOCK_RETRY_JITTER: 400
        },
        ioredis: class Redis {
          on () {}
          get () { return getStub() }
        },
        redlock: class Redlock {
          on () {}
        }
      })
      repository = new Repository()
    })

    it('should call get from redis instance and return a new aggregate', async () => {
      await repository.get('id')

      expect(getStub.calledOnce).to.be.true()
    })

    it('should call get from redis instance and return an existing aggregate', async () => {
      await repository.get('id')

      expect(getStub.calledOnce).to.be.true()
    })
  })

  describe('#record', () => {
    let lockStub, delSpy, recordSpy, unlockSpy
    const testAggregates = [
      { id: 'id' },
      { id: { id: 'id' } },
      { id: { id: 'id' } },
      { id: { id: 'id' } }
    ]
    const setStub = sinon.stub()
      .onCall(0).returns(true)
      .onCall(1).returns(true)
      .onCall(2).throws()
      .onCall(3).throws()
      .onCall(4).returns(true)

    afterEach(() => {
      Repository = null
      repository = null

      lockStub = null
      delSpy = null
      recordSpy = null
      unlockSpy = null
    })

    beforeEach(() => {
      delSpy = sinon.spy()
      recordSpy = sinon.spy()
      unlockSpy = sinon.spy()

      lockStub = sinon.stub().returns(Promise.resolve({ unlock: unlockSpy }))

      Repository = proxyquire('../src/repository', {
        '../conf/appConfig': {
          CACHE_URL: '',
          LOCK_TTL: 1000,
          LOCK_DRIFT_FACTOR: 0.01,
          LOCK_RETRY_COUNT: 0,
          LOCK_RETRY_DELAY: 400,
          LOCK_RETRY_JITTER: 400
        },
        ioredis: class Redis {
          on () {}
          set () { setStub() }
          del () { delSpy() }
        },
        redlock: class Redlock {
          on () {}
          lock () { return lockStub() }
        }
      })
      repository = new Repository({ record: recordSpy })
    })

    it('should record the event in the store and cache the aggregate in redis', async () => {
      await repository.record({}, {}, testAggregates.shift())

      expect(lockStub.calledOnce).to.be.true()
      expect(delSpy.called).to.be.false()
      expect(recordSpy.calledOnce).to.be.true()
      expect(setStub.calledOnce).to.be.true()
      expect(unlockSpy.calledOnce).to.be.true()
    })

    it('should record the event in the store and cache the aggregate (id is Value Object) in redis', async () => {
      await repository.record({}, {}, testAggregates.shift())

      expect(lockStub.calledOnce).to.be.true()
      expect(recordSpy.calledOnce).to.be.true()
      expect(setStub.calledTwice).to.be.true()
      expect(unlockSpy.calledOnce).to.be.true()
    })

    it('should throw an error in the transaction with undefined cache', async () => {
      try {
        await repository.record({}, {}, testAggregates.shift())
      } catch (e) {
        expect(lockStub.calledOnce).to.be.true()
        expect(delSpy.calledOnce).to.be.true()
        expect(recordSpy.called).to.be.false()
        expect(setStub.callCount).to.equal(3)
        expect(unlockSpy.calledOnce).to.be.true()
      }
    })

    it('should throw an error in the transaction with defined cache', async () => {
      try {
        await repository.record({}, {}, testAggregates.shift(), 'true')
      } catch (e) {
        expect(lockStub.calledOnce).to.be.true()
        expect(delSpy.called).to.be.false()
        expect(recordSpy.called).to.be.false()
        expect(setStub.callCount).to.equal(5)
        expect(unlockSpy.calledOnce).to.be.true()
      }
    })
  })

  describe('#update', () => {
    let lockStub, setSpy, unlockSpy
    const testAggregates = [
      { id: 'id' },
      { id: { id: 'id' } }
    ]

    afterEach(() => {
      Repository = null
      repository = null

      lockStub = null
      setSpy = null
      unlockSpy = null
    })

    beforeEach(() => {
      setSpy = sinon.spy()
      unlockSpy = sinon.spy()

      lockStub = sinon.stub().returns(Promise.resolve({ unlock: unlockSpy }))

      Repository = proxyquire('../src/repository', {
        '../conf/appConfig': {
          CACHE_URL: '',
          LOCK_TTL: 1000,
          LOCK_DRIFT_FACTOR: 0.01,
          LOCK_RETRY_COUNT: 0,
          LOCK_RETRY_DELAY: 400,
          LOCK_RETRY_JITTER: 400
        },
        ioredis: class Redis {
          on () {}
          set () { setSpy() }
        },
        redlock: class Redlock {
          on () {}
          lock () { return lockStub() }
        }
      })
      repository = new Repository()
    })

    it('should update the aggregate in the redis cache', async () => {
      await repository.update(testAggregates.shift())

      expect(lockStub.calledOnce).to.be.true()
      expect(setSpy.calledOnce).to.be.true()
      expect(unlockSpy.calledOnce).to.be.true()
    })

    it('should update the aggregate (id is Value Object) in the redis cache', async () => {
      await repository.update(testAggregates.shift())

      expect(lockStub.calledOnce).to.be.true()
      expect(setSpy.calledOnce).to.be.true()
      expect(unlockSpy.calledOnce).to.be.true()
    })
  })
})

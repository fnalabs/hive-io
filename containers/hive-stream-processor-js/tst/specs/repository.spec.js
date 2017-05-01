import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('repository', () => {
    let Repository, repository;

    describe('#constructor', () => {
        let redisSpy, redisOnSpy, redlockSpy, redlockOnSpy;

        before(() => {
            redisSpy = sinon.spy();
            redisOnSpy = sinon.spy();
            redlockSpy = sinon.spy();
            redlockOnSpy = sinon.spy();

            Repository = proxyquire('../../src/repository', {
                ioredis: class Redis {
                    constructor() { redisSpy(); }
                    on() { redisOnSpy(); }
                },
                redlock: class Redlock {
                    constructor() { redlockSpy(); }
                    on() { redlockOnSpy(); }
                }
            });
            repository = new Repository();
        });

        it('should create the Repository object', () => {
            expect(repository).to.exist;

            expect(repository.delete).to.be.a('function');
            expect(repository.get).to.be.a('function');
            expect(repository.record).to.be.a('function');
            expect(repository.update).to.be.a('function');

            expect(redisSpy.calledOnce).to.be.true;
            expect(redisOnSpy.calledOnce).to.be.true;
            expect(redlockSpy.calledOnce).to.be.true;
            expect(redlockOnSpy.calledOnce).to.be.true;
        });

        after(() => {
            Repository = null;
            repository = null;

            redisSpy = null;
            redlockSpy = null;
        });
    });

    describe('#delete', () => {
        let deleteSpy;

        before(() => {
            deleteSpy = sinon.spy();

            Repository = proxyquire('../../src/repository', {
                ioredis: class Redis {
                    on() {}
                    del() { deleteSpy(); }
                },
                redlock: class Redlock {
                    on() {}
                }
            });
            repository = new Repository();
        });

        it('should call delete from redis instance', async () => {
            await repository.delete();

            expect(deleteSpy.calledOnce).to.be.true;
        });

        after(() => {
            Repository = null;
            repository = null;

            deleteSpy = null;
        });
    });

    describe('#get', () => {
        let getStub, aggregateSpy;

        before(() => {
            getStub = sinon.stub().returns(Promise.resolve('{}'));
            aggregateSpy = sinon.spy();

            Repository = proxyquire('../../src/repository', {
                ioredis: class Redis {
                    on() {}
                    get() { return getStub(); }
                },
                redlock: class Redlock {
                    on() {}
                }
            });
            repository = new Repository();
        });

        it('should call get from redis instance and return a new aggregate', async () => {
            await repository.get('id', class Aggregate { constructor() { aggregateSpy(); } });

            expect(getStub.calledOnce).to.be.true;
            expect(aggregateSpy.calledOnce).to.be.true;
        });

        after(() => {
            Repository = null;
            repository = null;

            getStub = null;
            aggregateSpy = null;
        });
    });

    describe('#record', () => {
        let lockStub, logSpy, setSpy, unlockSpy;
        const testAggregates = [
            { id: 'id' },
            { id: { id: 'id' } }
        ];

        beforeEach(() => {
            logSpy = sinon.spy();
            setSpy = sinon.spy();
            unlockSpy = sinon.spy();

            lockStub = sinon.stub().returns(Promise.resolve({ unlock: unlockSpy }));

            Repository = proxyquire('../../src/repository', {
                ioredis: class Redis {
                    on() {}
                    set() { setSpy(); }
                },
                redlock: class Redlock {
                    on() {}
                    lock() { return lockStub(); }
                }
            });
            repository = new Repository({ log: logSpy });
        });

        it('should record the event in the store and cache the aggregate in redis', async () => {
            await repository.record({}, testAggregates.shift());

            expect(lockStub.calledOnce).to.be.true;
            expect(logSpy.calledOnce).to.be.true;
            expect(setSpy.calledOnce).to.be.true;
            expect(unlockSpy.calledOnce).to.be.true;
        });

        it('should record the event in the store and cache the aggregate (id is Value Object) in redis', async () => {
            await repository.record({}, testAggregates.shift());

            expect(lockStub.calledOnce).to.be.true;
            expect(logSpy.calledOnce).to.be.true;
            expect(setSpy.calledOnce).to.be.true;
            expect(unlockSpy.calledOnce).to.be.true;
        });

        afterEach(() => {
            Repository = null;
            repository = null;

            lockStub = null;
            logSpy = null;
            setSpy = null;
            unlockSpy = null;
        });
    });

    describe('#update', () => {
        let lockStub, setSpy, unlockSpy;
        const testAggregates = [
            { id: 'id' },
            { id: { id: 'id' } }
        ];

        beforeEach(() => {
            setSpy = sinon.spy();
            unlockSpy = sinon.spy();

            lockStub = sinon.stub().returns(Promise.resolve({ unlock: unlockSpy }));

            Repository = proxyquire('../../src/repository', {
                ioredis: class Redis {
                    on() {}
                    set() { setSpy(); }
                },
                redlock: class Redlock {
                    on() {}
                    lock() { return lockStub(); }
                }
            });
            repository = new Repository();
        });

        it('should update the aggregate in the redis cache', async () => {
            await repository.update(testAggregates.shift());

            expect(lockStub.calledOnce).to.be.true;
            expect(setSpy.calledOnce).to.be.true;
            expect(unlockSpy.calledOnce).to.be.true;
        });

        it('should update the aggregate (id is Value Object) in the redis cache', async () => {
            await repository.update(testAggregates.shift());

            expect(lockStub.calledOnce).to.be.true;
            expect(setSpy.calledOnce).to.be.true;
            expect(unlockSpy.calledOnce).to.be.true;
        });

        afterEach(() => {
            Repository = null;
            repository = null;

            lockStub = null;
            setSpy = null;
            unlockSpy = null;
        });
    });

});

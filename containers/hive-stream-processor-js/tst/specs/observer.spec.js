import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('observer', () => {
    let Observer, observer;

    describe('#constructor', () => {
        let consumerSpy, observableStubs;

        before(() => {
            consumerSpy = sinon.spy();
            observableStubs = {
                fromEventPattern: sinon.stub().returnsThis(),
                concatMap: sinon.stub().returnsThis(),
                subscribe: sinon.stub().returnsThis()
            };

            Observer = proxyquire('../../src/observer', {
                'rxjs/Rx': {
                    Observable: observableStubs
                }
            });
            observer = new Observer({}, {}, { consumer: { on: consumerSpy } });
        });

        it('should create the Observer object', () => {
            expect(observer).to.exist;

            expect(observer.handle).to.be.a('function');
            expect(observer.execute).to.be.a('function');

            expect(consumerSpy.called).to.be.false;
            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;
        });

        after(() => {
            Observer = null;
            observer = null;

            consumerSpy = null;
            observableStubs = null;
        });
    });

    describe('#handle', () => {
        let consumerSpy, executeSpy, observableStubs;

        before(() => {
            consumerSpy = sinon.spy();
            executeSpy = sinon.spy();
            observableStubs = {
                fromEventPattern: sinon.stub().returnsThis(),
                fromPromise: sinon.stub().returnsThis(),
                concatMap: sinon.stub().returnsThis(),
                subscribe: sinon.stub().returnsThis()
            };

            Observer = proxyquire('../../src/observer', {
                'rxjs/Rx': {
                    Observable: observableStubs
                }
            });
            observer = new Observer({}, {}, { consumer: { on: consumerSpy } });
            observer.execute = executeSpy;
            observer.handle({ value: '{ "id": "id", "name": "Created" }' });
        });

        it('should handle a normal Create event', () => {
            expect(consumerSpy.called).to.be.false;
            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.fromPromise.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;
            expect(executeSpy.calledOnce).to.be.true;
        });

        after(() => {
            Observer = null;
            observer = null;

            consumerSpy = null;
            observableStubs = null;
            executeSpy = null;
        });
    });

    describe('#execute', () => {
        let getStub, getKeySpy, updateSpy, observableStubs;
        const valueData = [
            { value: { id: 'id', name: 'Created' } },
            { value: { id: { id: 'id' }, name: 'Created' } },
            { value: { id: 'id', name: 'Modified' } },
            { value: { id: 'id', name: 'Modified' } },
            { value: { id: 'id', name: 'Modified' } }
        ];
        const getStubs = [
            sinon.stub().returns({ id: 'new', applyData() {} }),
            sinon.stub().returns({ id: 'original', applyData() {} }),
            sinon.stub().returns({ id: 'original', applyData() {} }),
            sinon.stub().throws(Error),
            sinon.stub().onFirstCall().returns({ id: 'original', applyData() {} }).onSecondCall().throws(Error)
        ];

        beforeEach(() => {
            getStub = getStubs.shift();
            getKeySpy = sinon.spy();
            updateSpy = sinon.spy();
            observableStubs = {
                fromEventPattern: sinon.stub().returnsThis(),
                concatMap: sinon.stub().returnsThis(),
                subscribe: sinon.stub().returnsThis()
            };

            Observer = proxyquire('../../src/observer', {
                'rxjs/Rx': {
                    Observable: observableStubs
                }
            });
            observer = new Observer(
                {},
                { get: getStub, getKey: getKeySpy, update: updateSpy },
                { consumer: { on: () => {} } }
            );
        });

        it('should execute a simple Create event', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should execute a Create event with a Value Object id', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should execute a simple non-create event', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should catch an error if thrown from db query', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(updateSpy.called).to.be.false;
        });

        it('should catch an error if thrown from db update', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        afterEach(() => {
            Observer = null;
            observer = null;

            getStub = null;
            getKeySpy = null;
            updateSpy = null;
            observableStubs = null;
        });
    });

});

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
                '../conf/appConfig': { UPDATE_OPTIONS: '' },
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
        let constructorSpy, applyDataSpy, projectionStubs, observableStubs;
        const valueData = [
            { id: 'id', name: 'Created' },
            { id: { id: 'id' }, name: 'Created' },
            { id: 'id', name: 'Modified' },
            { id: 'id', name: 'Modified' },
            { id: 'id', name: 'Modified' }
        ];
        const execStubs = [
            sinon.spy(),
            sinon.spy(),
            sinon.stub().returns({ id: 'original' }),
            sinon.stub().throws(Error),
            sinon.stub().onFirstCall().returns({ id: 'original' }).onSecondCall().throws(Error)
        ];

        beforeEach(() => {
            constructorSpy = sinon.spy();
            applyDataSpy = sinon.spy();
            projectionStubs = {
                findOne: sinon.stub().returnsThis(),
                findOneAndUpdate: sinon.stub().returnsThis(),
                exec: execStubs.shift()
            };
            observableStubs = {
                fromEventPattern: sinon.stub().returnsThis(),
                concatMap: sinon.stub().returnsThis(),
                subscribe: sinon.stub().returnsThis()
            };

            class Aggregate {
                constructor() { constructorSpy(); }
                applyData() { applyDataSpy(); }
            }
            class Projection {
                static findOne() { return projectionStubs.findOne(); }
                static findOneAndUpdate() { return projectionStubs.findOneAndUpdate(); }
                static async exec() { return projectionStubs.exec(); }
            }

            Observer = proxyquire('../../src/observer', {
                '../conf/appConfig': { UPDATE_OPTIONS: '' },
                'rxjs/Rx': {
                    Observable: observableStubs
                }
            });
            observer = new Observer(Aggregate, Projection, { consumer: { on: () => {} } });
        });

        it('should execute a simple Create event', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(projectionStubs.findOne.calledOnce).to.be.true;
            expect(projectionStubs.findOneAndUpdate.calledOnce).to.be.true;
            expect(projectionStubs.exec.calledTwice).to.be.true;
        });

        it('should execute a Create event with a Value Object id', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(projectionStubs.findOne.calledOnce).to.be.true;
            expect(projectionStubs.findOneAndUpdate.calledOnce).to.be.true;
            expect(projectionStubs.exec.calledTwice).to.be.true;
        });

        it('should execute a simple non-create event', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(projectionStubs.findOne.calledOnce).to.be.true;
            expect(projectionStubs.findOneAndUpdate.calledOnce).to.be.true;
            expect(projectionStubs.exec.calledTwice).to.be.true;
        });

        it('should catch an error if thrown from db query', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(constructorSpy.called).to.be.false;
            expect(applyDataSpy.called).to.be.false;
            expect(projectionStubs.findOne.calledOnce).to.be.true;
            expect(projectionStubs.findOneAndUpdate.called).to.be.false;
            expect(projectionStubs.exec.calledOnce).to.be.true;
        });

        it('should catch an error if thrown from db update', async () => {
            await observer.execute(valueData.shift());

            expect(observableStubs.fromEventPattern.calledOnce).to.be.true;
            expect(observableStubs.concatMap.calledOnce).to.be.true;
            expect(observableStubs.subscribe.calledOnce).to.be.true;

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(projectionStubs.findOne.calledOnce).to.be.true;
            expect(projectionStubs.findOneAndUpdate.calledOnce).to.be.true;
            expect(projectionStubs.exec.calledTwice).to.be.true;
        });

        afterEach(() => {
            Observer = null;
            observer = null;

            constructorSpy = null;
            applyDataSpy = null;
            projectionStubs = null;
            observableStubs = null;
        });
    });

});

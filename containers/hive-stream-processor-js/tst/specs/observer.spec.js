import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('observer', () => {
    let Observer, observer;

    describe('#constructor', () => {
        let consumerSpy;

        before(() => {
            consumerSpy = sinon.spy();

            Observer = proxyquire('../../src/observer', {});
            observer = new Observer({}, {}, { consumer: { on: consumerSpy } });
        });

        it('should create the Observer object', () => {
            expect(observer).to.exist;

            expect(observer.handle).to.be.a('function');

            expect(consumerSpy.calledOnce).to.be.true;
        });

        after(() => {
            Observer = null;
            observer = null;

            consumerSpy = null;
        });
    });

    describe('#handle', () => {
        let constructorSpy, applyDataSpy, getStub, updateSpy;
        const eventData = [
            { value: '{ "id": "id", "name": "Create" }' },
            { value: '{ "id": "id", "name": "Modify" }' }
        ];
        const getStubs = [
            sinon.spy(),
            sinon.stub().throws(Error)
        ];

        beforeEach(() => {
            constructorSpy = sinon.spy();
            applyDataSpy = sinon.spy();
            getStub = getStubs.shift();
            updateSpy = sinon.spy();

            class Aggregate {
                constructor() { constructorSpy(); }
                applyData() { applyDataSpy(); }
            }

            Observer = proxyquire('../../src/observer', {});
            observer = new Observer(
                Aggregate,
                { get: getStub, update: updateSpy },
                { consumer: { on: () => {} } }
            );
        });

        it('should handle a normal Create event', async () => {
            await observer.handle(eventData.shift());

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(getStub.called).to.be.false;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should handle a caught error if thrown from db query', async () => {
            await observer.handle(eventData.shift());

            expect(constructorSpy.called).to.be.false;
            expect(applyDataSpy.called).to.be.false;
            expect(getStub.calledOnce).to.be.true;
            expect(updateSpy.called).to.be.false;
        });

        afterEach(() => {
            Observer = null;
            observer = null;

            constructorSpy = null;
            applyDataSpy = null;
            getStub = null;
            updateSpy = null;
        });
    });

    describe('#execute', () => {
        let constructorSpy, applyDataSpy, getStub, updateSpy;
        const eventData = [
            { value: '{ "id": "id", "name": "Create" }' },
            { value: '{ "id": { "id": "id" }, "name": "Create" }' },
            { value: '{ "id": "id", "name": "Modify" }' },
            { value: '{ "id": "id", "name": "Modify" }' },
            { value: '{ "id": "id", "name": "Modify" }' }
        ];
        const getStubs = [
            sinon.spy(),
            sinon.spy(),
            sinon.stub().returns({ id: 'original', applyData() {} }),
            sinon.stub().throws(Error),
            sinon.stub().onFirstCall().returns({ id: 'original', applyData() {} }).onSecondCall().throws(Error)
        ];

        beforeEach(() => {
            constructorSpy = sinon.spy();
            applyDataSpy = sinon.spy();
            getStub = getStubs.shift();
            updateSpy = sinon.spy();

            class Aggregate {
                constructor() { constructorSpy(); }
                applyData() { applyDataSpy(); }
            }

            Observer = proxyquire('../../src/observer', {});
            observer = new Observer(
                Aggregate,
                { get: getStub, update: updateSpy },
                { consumer: { on: () => {} } }
            );
        });

        it('should execute a simple Create event', async () => {
            await observer.execute(eventData.shift());

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(getStub.called).to.be.false;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should execute a Create event with a Value Object id', async () => {
            await observer.execute(eventData.shift());

            expect(constructorSpy.calledOnce).to.be.true;
            expect(applyDataSpy.calledOnce).to.be.true;
            expect(getStub.called).to.be.false;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should execute a simple non-create event', async () => {
            await observer.execute(eventData.shift());

            expect(constructorSpy.called).to.be.false;
            expect(applyDataSpy.called).to.be.false;
            expect(getStub.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it('should catch an error if thrown from db query', async () => {
            await observer.execute(eventData.shift());

            expect(constructorSpy.called).to.be.false;
            expect(applyDataSpy.called).to.be.false;
            expect(getStub.calledOnce).to.be.true;
            expect(updateSpy.called).to.be.false;
        });

        it('should catch an error if thrown from db update', async () => {
            await observer.execute(eventData.shift());

            expect(constructorSpy.called).to.be.false;
            expect(applyDataSpy.called).to.be.false;
            expect(getStub.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        afterEach(() => {
            Observer = null;
            observer = null;

            constructorSpy = null;
            applyDataSpy = null;
            getStub = null;
            updateSpy = null;
        });
    });

});

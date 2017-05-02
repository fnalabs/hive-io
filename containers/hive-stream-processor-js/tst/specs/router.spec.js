import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('router', () => {
    let Router, router, context, postSpy;

    function init(data) {
        context = {
            request: {
                body: data
            },
            status: 200
        };

        postSpy = sinon.spy();
        Router = proxyquire('../../src/router', {
            'koa-router': class RouterClass { post = postSpy }
        });
    }

    describe('#constructor', () => {
        before(() => {
            init();
            router = new Router();
        });

        it('should create the Router object', () => {
            expect(router).to.exist;

            expect(router.postCommand).to.be.a('function');

            expect(postSpy.calledOnce).to.be.true;
        });

        after(() => {
            Router = null;
            router = null;
            context = null;
            postSpy = null;
        });
    });

    describe('#postCommand', () => {
        let getStub, getKeySpy, recordStub, createHandleStub, modifyHandleStub, aggregateSpy;
        const getStubs = [
            sinon.spy(),
            sinon.stub().returns({ id: 'id' }),
            sinon.stub().returns({ id: { id: 'id' } }),
            sinon.stub().throws(Error),
            sinon.stub().returns({ id: 'id' })
        ];
        const recordStubs = [
            sinon.spy(),
            sinon.spy(),
            sinon.spy(),
            sinon.spy(),
            sinon.stub().throws(Error)
        ];
        const testData = [
            { id: 'id', name: 'Created' },
            { id: 'id', name: 'Modified' },
            { id: { id: 'id' }, name: 'Modified' },
            { id: 'id', name: 'Modified' },
            { id: 'id', name: 'Modified' }
        ];

        beforeEach(() => {
            getStub = getStubs.shift();
            getKeySpy = sinon.spy();
            recordStub = recordStubs.shift();
            createHandleStub = sinon.stub().returns({ id: 'id' });
            modifyHandleStub = sinon.stub().returns({ id: 'id' });
            aggregateSpy = sinon.spy();

            class AggregateStub { constructor() { this.stub = true; aggregateSpy(); } }

            init(testData.shift());
            router = new Router(
                AggregateStub,
                { Created: { handle: createHandleStub }, Modified: { handle: modifyHandleStub } },
                { get: getStub, getKey: getKeySpy, record: recordStub }
            );
        });

        it('should handle normal post requests for creates', async () => {
            await router.postCommand(context);

            expect(context.body).to.be.an('object');
            expect(context.body.id).to.be.a('string');
            expect(context.body.id).to.equal('id');
            expect(context.status).to.equal(200);

            expect(getStub.called).to.be.false;
            expect(getKeySpy.called).to.be.false;
            expect(recordStub.calledOnce).to.be.true;
            expect(createHandleStub.calledOnce).to.be.true;
            expect(modifyHandleStub.called).to.be.false;
            expect(aggregateSpy.calledOnce).to.be.true;
        });

        it('should handle normal post requests for non-creates', async () => {
            await router.postCommand(context);

            expect(context.body).to.be.an('object');
            expect(context.body.id).to.be.a('string');
            expect(context.body.id).to.equal('id');
            expect(context.status).to.equal(200);

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(recordStub.calledOnce).to.be.true;
            expect(createHandleStub.called).to.be.false;
            expect(modifyHandleStub.calledOnce).to.be.true;
            expect(aggregateSpy.called).to.be.false;
        });

        it('should handle normal post requests for id Value Objects', async () => {
            await router.postCommand(context);

            expect(context.body).to.be.an('object');
            expect(context.body.id).to.be.a('string');
            expect(context.body.id).to.equal('id');
            expect(context.status).to.equal(200);

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(recordStub.calledOnce).to.be.true;
            expect(createHandleStub.called).to.be.false;
            expect(modifyHandleStub.calledOnce).to.be.true;
            expect(aggregateSpy.called).to.be.false;
        });

        it('should throw an error on get that is caught', async () => {
            await router.postCommand(context);

            expect(context.status).to.equal(400);

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(recordStub.called).to.be.false;
            expect(createHandleStub.called).to.be.false;
            expect(modifyHandleStub.called).to.be.false;
            expect(aggregateSpy.called).to.be.false;
        });

        it('should throw an error on record that is caught', async () => {
            await router.postCommand(context);

            expect(context.status).to.equal(400);

            expect(getStub.calledOnce).to.be.true;
            expect(getKeySpy.calledOnce).to.be.true;
            expect(recordStub.calledOnce).to.be.true;
            expect(createHandleStub.called).to.be.false;
            expect(modifyHandleStub.calledOnce).to.be.true;
            expect(aggregateSpy.called).to.be.false;
        });

        afterEach(() => {
            Router = null;
            router = null;
            context = null;

            getStub = null;
            getKeySpy = null;
            recordStub = null;
            createHandleStub = null;
            modifyHandleStub = null;
            aggregateSpy = null;
        });
    });

});

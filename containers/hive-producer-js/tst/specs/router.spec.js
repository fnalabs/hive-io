import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('router', () => {
    let Router, router, context, postSpy;

    function init() {
        context = {
            request: {
                body: {}
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

            expect(router.postModel).to.be.a('function');

            expect(postSpy.calledOnce).to.be.true;
        });

        after(() => {
            Router = null;
            router = null;
            context = null;
            postSpy = null;
        });
    });

    describe('#postModel', () => {
        let logStub, modelSpy;
        const logStubs = [ sinon.stub(), sinon.stub().throws(Error) ];

        beforeEach(() => {
            logStub = logStubs.shift();
            modelSpy = sinon.spy();

            class ModelStub { constructor() { this.stub = true; modelSpy(); } }

            init();
            router = new Router(ModelStub, { log: logStub });
        });

        it('should handle normal get requests', async () => {
            await router.postModel(context);

            expect(context.body).to.be.an('object');
            expect(context.body.stub).to.be.true;
            expect(context.status).to.equal(200);

            expect(logStub.calledOnce).to.be.true;
            expect(modelSpy.calledOnce).to.be.true;
        });

        it('should throw an error on log that is caught to call next()', async () => {
            await router.postModel(context);

            expect(context.status).to.equal(400);

            expect(logStub.calledOnce).to.be.true;
            expect(modelSpy.calledOnce).to.be.true;
        });

        afterEach(() => {
            Router = null;
            router = null;
            context = null;

            logStub = null;
            modelSpy = null;
        });

    });

});

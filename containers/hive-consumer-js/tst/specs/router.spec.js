import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('router', () => {
    let Router, router, context, getStub;

    function init() {
        context = {
            params: {},
            status: 200
        };

        getStub = sinon.stub().returnsThis();
        Router = proxyquire('../../src/router', {
            'koa-router': class RouterClass { get = getStub }
        });
    }

    describe('#constructor', () => {
        before(() => {
            init();
            router = new Router();
        });

        it('should create the Router object', () => {
            expect(router).to.exist;

            expect(router.getProjection).to.be.a('function');
            expect(router.getAllProjection).to.be.a('function');

            expect(getStub.calledTwice).to.be.true;
        });

        after(() => {
            Router = null;
            router = null;
            context = null;
            getStub = null;
        });
    });

    describe('#getProjection', () => {
        let schemaPathStub, stubHash;
        const execStubs = [
            sinon.stub().returns({ stub: true }),
            sinon.stub().returns({ stub: true }),
            sinon.stub().returns(undefined),
            sinon.stub().throws(Error)
        ];
        const schemaPaths = [
            'id',
            'id.id',
            'id',
            'id'
        ];

        beforeEach(() => {
            stubHash = {
                findOne: sinon.stub().returnsThis(),
                exec: execStubs.shift()
            };

            schemaPathStub = {};
            schemaPathStub[schemaPaths.shift()] = {};

            class ProjectionModel {
                static schema = { paths: schemaPathStub }
                static findOne() { return stubHash.findOne(); }
                static async exec() { return stubHash.exec(); }
            }

            init();
            router = new Router(ProjectionModel);
        });

        it('should handle normal get requests for a standard id', async () => {
            await router.getProjection(context);

            expect(context.body).to.be.an('object');
            expect(context.body.stub).to.be.true;
            expect(context.status).to.equal(200);

            expect(stubHash.findOne.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        it('should handle normal get requests for a Value Object id', async () => {
            await router.getProjection(context);

            expect(context.body).to.be.an('object');
            expect(context.body.stub).to.be.true;
            expect(context.status).to.equal(200);

            expect(stubHash.findOne.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        it('should return a 204 if no data was found', async () => {
            await router.getProjection(context);

            expect(context.body).to.be.undefined;
            expect(context.status).to.equal(204);

            expect(stubHash.findOne.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        it('should return a 400 if an error occurred on querying the DB', async () => {
            await router.getProjection(context);

            expect(context.body).to.be.undefined;
            expect(context.status).to.equal(400);

            expect(stubHash.findOne.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        afterEach(() => {
            Router = null;
            router = null;
            context = null;

            schemaPathStub = null;
            stubHash = null;
        });
    });

    describe('#getAllProjection', () => {
        let stubHash;
        const execStubs = [
            sinon.stub().returns([{ stub: true }]),
            sinon.stub().returns([]),
            sinon.stub().throws(Error)
        ];

        beforeEach(() => {
            stubHash = {
                find: sinon.stub().returnsThis(),
                exec: execStubs.shift()
            };

            class ProjectionModel {
                static find() { return stubHash.find(); }
                static async exec() { return stubHash.exec(); }
            }

            init();
            router = new Router(ProjectionModel);
        });

        it('should handle normal get all requests', async () => {
            await router.getAllProjection(context);

            expect(context.body).to.be.an('array');
            expect(context.body.length).to.equal(1);
            expect(context.body[0].stub).to.be.true;
            expect(context.status).to.equal(200);

            expect(stubHash.find.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        it('should return a 204 if no data was found', async () => {
            await router.getAllProjection(context);

            expect(context.body).to.be.an('array');
            expect(context.body.length).to.equal(0);
            expect(context.status).to.equal(204);

            expect(stubHash.find.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        it('should return a 400 if an error occurred on querying the DB', async () => {
            await router.getAllProjection(context);

            expect(context.body).to.be.undefined;
            expect(context.status).to.equal(400);

            expect(stubHash.find.calledOnce).to.be.true;
            expect(stubHash.exec.calledOnce).to.be.true;
        });

        afterEach(() => {
            Router = null;
            router = null;
            context = null;

            stubHash = null;
        });
    });

});

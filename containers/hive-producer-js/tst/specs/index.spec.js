import proxyquire from 'proxyquire';
import request from 'supertest';
import sinon from 'sinon';

describe('app', () => {
    let app, logStub;

    describe('#routes', () => {
        let logStubs = [
            sinon.stub(),
            sinon.stub(),
            sinon.stub().throws(Error),
            sinon.stub()
        ];

        beforeEach(() => {
            logStub = logStubs.shift();

            app = proxyquire('../../src/', {
                './store': class Store { log() { logStub(); } }
            }).listen();
        });

        it('should respond with 200 from /health', (done) => {
            request(app)
                .get('/health')
                .expect(200, done);
        });

        it('should respond with 200 from / on successful post', (done) => {
            request(app)
                .post('/')
                .send({})
                .expect(200, done);
        });

        it('should respond with 400 from / on unsuccessful post', (done) => {
            request(app)
                .post('/')
                .send({})
                .expect(400, done);
        });

        it('should respond with 404 from unspecified routes', (done) => {
            request(app)
                .get('/unspecified')
                .expect(404, 'Not Found', done);
        });

        afterEach(() => {
            app = null;
            logStub = null;
        });

    });

});

import proxyquire from 'proxyquire';
import request from 'supertest';

describe('app', () => {
    let app;

    describe('#routes', () => {
        beforeEach(() => {
            app = proxyquire('../../src/', {
                mongoose: {
                    default: {},
                    model: { call() {} }
                },
                './store': class Store {
                    get consumer() { return { on: () => {} }; }
                }
            }).listen();
        });

        it('should init app properly and respond with 200 from /health', (done) => {
            request(app)
                .get('/health')
                .expect(200, done);
        });

        afterEach(() => {
            app = null;
        });
    });

});

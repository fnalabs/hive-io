import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('store', () => {
    let Store, store;

    describe('#constructor', () => {
        let clientSpy, consumerSpy, producerSpy, refreshSpy;

        before(() => {
            clientSpy = sinon.spy();
            consumerSpy = sinon.spy();
            producerSpy = sinon.spy();
            refreshSpy = sinon.spy();

            Store = proxyquire('../../src/store', {
                '../conf/appConfig': {
                    AGGREGATE_LIST: '',
                    EVENT_STORE_URL: '',
                    EVENT_STORE_ID: '',
                    EVENT_STORE_TYPE: '',
                    EVENT_STORE_TIMEOUT: '',
                    EVENT_STORE_PROTOCOL: '',
                    EVENT_STORE_OFFSET: '',
                    MODEL: ''
                },
                'kafka-node': {
                    Client: class Client {
                        constructor() { clientSpy(); }
                        refreshMetadata() { refreshSpy(); }
                    },
                    ConsumerGroup: class HighLevelProducer {
                        constructor() { consumerSpy(); }
                    },
                    HighLevelProducer: class HighLevelProducer {
                        constructor() { producerSpy(); }
                    }
                }
            });
            store = new Store();
        });

        it('should create the Store object', () => {
            expect(store).to.exist;

            expect(store.consumer).to.be.an('object');
            expect(store.log).to.be.a('function');

            expect(clientSpy.calledOnce).to.be.true;
            expect(consumerSpy.calledOnce).to.be.true;
            expect(producerSpy.calledOnce).to.be.true;
            expect(refreshSpy.calledOnce).to.be.true;
        });

        after(() => {
            Store = null;
            store = null;

            clientSpy = null;
            consumerSpy = null;
            producerSpy = null;
            refreshSpy = null;
        });
    });

    describe('#log', () => {
        let sendStub;
        const sendStubs = [
            (data, cb) => cb(false, {}),
            (data, cb) => cb(true, {})
        ];

        beforeEach(() => {
            sendStub = sendStubs.shift();

            Store = proxyquire('../../src/store', {
                '../conf/appConfig': {
                    AGGREGATE_LIST: '',
                    EVENT_STORE_URL: '',
                    EVENT_STORE_ID: '',
                    EVENT_STORE_TYPE: '',
                    EVENT_STORE_TIMEOUT: '',
                    EVENT_STORE_PROTOCOL: '',
                    EVENT_STORE_OFFSET: '',
                    MODEL: ''
                },
                'kafka-node': {
                    Client: class Client {
                        constructor() {}
                        refreshMetadata() {}
                    },
                    ConsumerGroup: class HighLevelProducer {
                        constructor() {}
                    },
                    HighLevelProducer: class HighLevelProducer {
                        constructor() {}
                        send(data, cb) { sendStub(data, cb); }
                    }
                }
            });
            store = new Store();
        });

        it('should handle normal log posts', async () => {
            await expect(store.log({})).to.eventually.be.fulfilled;
        });

        it('should be rejected', async () => {
            await expect(store.log({})).to.eventually.be.rejected;
        });

        afterEach(() => {
            Store = null;
            store = null;

            sendStub = null;
        });
    });

});

import proxyquire from 'proxyquire';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiAsPromised);

describe('store', () => {
    let Store, store;

    describe('#constructor', () => {
        let clientSpy, consumerSpy, refreshSpy;

        before(() => {
            clientSpy = sinon.spy();
            consumerSpy = sinon.spy();
            refreshSpy = sinon.spy();

            Store = proxyquire('../../src/store', {
                '../conf/appConfig': {
                    EVENT_STORE_URL: '',
                    EVENT_STORE_ID: '',
                    EVENT_STORE_TIMEOUT: '',
                    EVENT_STORE_PROTOCOL: '',
                    EVENT_STORE_OFFSET: '',
                    AGGREGATE_LIST: ''
                },
                'kafka-node': {
                    Client: class Client {
                        constructor() { clientSpy(); }
                        refreshMetadata() { refreshSpy(); }
                    },
                    ConsumerGroup: class HighLevelProducer {
                        constructor() { consumerSpy(); }
                    }
                }
            });
            store = new Store();
        });

        it('should create the Store object', () => {
            expect(store).to.exist;

            expect(store.consumer).to.be.an('object');

            expect(clientSpy.calledOnce).to.be.true;
            expect(consumerSpy.calledOnce).to.be.true;
            expect(refreshSpy.calledOnce).to.be.true;
        });

        after(() => {
            Store = null;
            store = null;

            clientSpy = null;
            consumerSpy = null;
            refreshSpy = null;
        });
    });

});

import CONFIG from '../config/appConfig';

import { Client, ConsumerGroup } from 'kafka-node';

const CLIENT = Symbol('reference to Kafka client connection');
const CONSUMER = Symbol('reference to Kafka ConsumerGroup');


export default class EventStore {

    constructor() {
        this[CLIENT] = new Client(CONFIG.EVENT_STORE_URL, `${CONFIG.EVENT_STORE_ID}-${process.pid}`);

        this[CONSUMER] = new ConsumerGroup({
            host: CONFIG.EVENT_STORE_URL,
            groupId: CONFIG.EVENT_STORE_ID,
            sessionTimeout: CONFIG.EVENT_STORE_TIMEOUT,
            protocol: [CONFIG.EVENT_STORE_PROTOCOL],
            fromOffset: CONFIG.EVENT_STORE_OFFSET
        }, CONFIG.AGGREGATE_LIST);

        // NOTE: this is required for our HighLevelProducer with KeyedPartitioner usage
        //        to resolve errors on first send on a fresh instance. see:
        //          - https://www.npmjs.com/package/kafka-node#highlevelproducer-with-keyedpartitioner-errors-on-first-send
        //          - https://github.com/SOHU-Co/kafka-node/issues/354
        //          - https://github.com/SOHU-Co/kafka-node/pull/378
        this[CLIENT].refreshMetadata(CONFIG.AGGREGATE_LIST, () => {});

        // NOTE: this is required for restarts as the consumer connection must be closed. for more info, see:
        //        https://www.npmjs.com/package/kafka-node#failedtorebalanceconsumererror-exception-node_exists-110
        process.on('SIGINT', this.close);
        process.on('SIGUSR2', this.close);
    }

    get consumer() {
        return this[CONSUMER];
    }

    close = () => {
        this[CONSUMER].close(true, () => {
            this[CLIENT].close(() => {
                process.kill(process.pid);
            });
        });
    }

}

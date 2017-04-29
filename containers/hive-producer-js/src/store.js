import CONFIG from '../conf/appConfig';

import { Client, HighLevelProducer } from 'kafka-node';

const CLIENT = Symbol('reference to Kafka client connection');
const PRODUCER = Symbol('reference to Kafka HighLevelProducer');

const CLOSE = Symbol('reference to method for closing the Kafka consumer/client');


export default class EventStore {

    constructor() {
        this[CLIENT] = new Client(CONFIG.EVENT_STORE_URL, `${CONFIG.EVENT_STORE_ID}-${process.pid}`);

        this[PRODUCER] = new HighLevelProducer(this[CLIENT], {
            partitionerType: CONFIG.EVENT_STORE_TYPE
        });

        // NOTE: this is required for our HighLevelProducer with KeyedPartitioner usage
        //        to resolve errors on first send on a fresh instance. see:
        //          - https://www.npmjs.com/package/kafka-node#highlevelproducer-with-keyedpartitioner-errors-on-first-send
        //          - https://github.com/SOHU-Co/kafka-node/issues/354
        //          - https://github.com/SOHU-Co/kafka-node/pull/378
        this[CLIENT].refreshMetadata([CONFIG.MODEL], () => {});

        // NOTE: this is required for restarts as the consumer connection must be closed. for more info, see:
        //        https://www.npmjs.com/package/kafka-node#failedtorebalanceconsumererror-exception-node_exists-110
        process.on('SIGINT', this[CLOSE]);
        process.on('SIGUSR2', this[CLOSE]);
    }

    [CLOSE] = () => {
        this[CLIENT].close(() => {
            process.kill(process.pid);
        });
    }

    log = async (model) => {
        await new Promise((resolve, reject) => {
            this[PRODUCER].send([{
                topic: CONFIG.MODEL,
                key: model.id,
                messages: JSON.stringify(model),
                attributes: 1
            }], (err, data) => {
                if (err) return reject(err);
                return resolve(data);
            });
        });
    }

}

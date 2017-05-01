import CONFIG from '../conf/appConfig';

const AGGREGATE = Symbol('reference for aggregate class');
const PROJECTION = Symbol('reference for query db connection object');
const QUEUE = Symbol('Promise queue for handling events');


export default class EventObserver {

    constructor(Aggregate, Projection, store) {
        this[AGGREGATE] = Aggregate;
        this[PROJECTION] = Projection;

        this[QUEUE] = Promise.resolve();

        // set handler to listen for messages from the event store consumer
        store.consumer.on('message', this.handle);
    }

    handle = event => {
        this[QUEUE].then(() => this.execute(event));
    }

    execute = async event => {
        const value = JSON.parse(event.value);

        // check if 'id' is a Value Object
        const queryHash = value.id.id ? { 'id.id': value.id.id } : { id: value.id };

        try {
            const data = (/^create/i).test(value.name) ?
                {} :
                await this[PROJECTION].findOne(queryHash).exec();

            const aggregate = new this[AGGREGATE](data);
            aggregate.applyData(value);

            await this[PROJECTION]
                .findOneAndUpdate(queryHash, aggregate, CONFIG.UPDATE_OPTIONS)
                .exec();
        }
        catch (e) {
            console.log(e);
        }
    }

}

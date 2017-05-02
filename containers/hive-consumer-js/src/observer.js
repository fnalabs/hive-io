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
        const key = value.id.id ? { 'id.id': value.id.id } : { id: value.id };

        try {
            const data = (/^Created/).test(value.name) ?
                {} :
                await this[PROJECTION].findOne(key).exec();

            const aggregate = new this[AGGREGATE](data);
            aggregate.applyData(value);

            await this[PROJECTION]
                .findOneAndUpdate(key, aggregate, CONFIG.UPDATE_OPTIONS)
                .exec();
        }
        catch (e) {
            console.log(e);
        }
    }

}

import CONFIG from '../conf/appConfig';

import Rx from 'rxjs/Rx';

const DENORMALIZER = Symbol('reference for denormalizer class');
const PROJECTION = Symbol('reference for query db connection object');
const OBSERVABLE = Symbol('reference to Observable instance for event stream');

export default class EventObserver {

    constructor(Denormalizer, Projection, store) {
        this[DENORMALIZER] = Denormalizer;
        this[PROJECTION] = Projection;

        // set observable to listen for messages from the event store consumer
        this[OBSERVABLE] = Rx.Observable
            .fromEventPattern(handler => store.consumer.on('message', handler))
            .concatMap(this.handle)
            .subscribe(() => {});
    }

    handle = event => {
        const value = JSON.parse(event.value);

        return Rx.Observable.fromPromise(this.execute(value));
    }

    execute = async value => {
        // check if 'id' is a Value Object
        const key = value.id.id ? { 'id.id': value.id.id } : { id: value.id };

        try {
            const data = await this[PROJECTION].findOne(key).exec();

            const aggregate = new this[DENORMALIZER](data || {});
            aggregate.applyData(value);

            await this[PROJECTION].findOneAndUpdate(key, aggregate, CONFIG.UPDATE_OPTIONS).exec();
        }
        catch (e) {
            console.log(e);
        }
    }

}

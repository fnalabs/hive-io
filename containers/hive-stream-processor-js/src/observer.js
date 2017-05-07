import Rx from 'rxjs/Rx';

const AGGREGATE = Symbol('reference for aggregate class');
const REPOSITORY = Symbol('reference for repository connection object');
const OBSERVABLE = Symbol('reference to Observable instance for event stream');


export default class EventObserver {

    constructor(Aggregate, repository, store) {
        this[AGGREGATE] = Aggregate;
        this[REPOSITORY] = repository;

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
        try {
            const aggregate = await this[REPOSITORY]
                .get(this[REPOSITORY].getKey(value, this[AGGREGATE].name), this[AGGREGATE]);

            aggregate.applyData(value);

            await this[REPOSITORY].update(aggregate);
        }
        catch (e) {
            console.log(e);
        }
    }

}

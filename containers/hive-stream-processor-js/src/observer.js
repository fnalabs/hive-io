const AGGREGATE = Symbol('reference for aggregate class');
const QUEUE = Symbol('Promise queue for synchronously handling events');
const REPOSITORY = Symbol('reference for repository connection object');


export default class EventObserver {

    constructor(Aggregate, repository) {
        this[AGGREGATE] = Aggregate;
        this[QUEUE] = Promise.resolve();
        this[REPOSITORY] = repository;

        // set handler to listen for messages from the event store consumer
        repository.store.consumer.on('message', this.handle);
    }

    handle = event => {
        this[QUEUE].then(async () => await this.execute(event));
    }

    execute = async event => {
        const value = JSON.parse(event.value);
        const aggregate = await this[REPOSITORY].get(value.id, this[AGGREGATE]);

        await this[REPOSITORY].update(aggregate.apply(value));
    }

}

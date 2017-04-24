const AGGREGATE = Symbol('reference for aggregate class');
const REPOSITORY = Symbol('reference for repository connection object');
const QUEUE = Symbol('Promise queue for synchronously handling events');


export default class EventObserver {

    constructor(Aggregate, repository, store) {
        this[AGGREGATE] = Aggregate;
        this[REPOSITORY] = repository;

        this[QUEUE] = Promise.resolve();

        // set handler to listen for messages from the event store consumer
        store.consumer.on('message', this.handle);
    }

    handle = event => {
        this[QUEUE].then(() => this.execute(event));
    }

    execute = async event => {
        const value = JSON.parse(event.value);
        const aggregate = await this[REPOSITORY].get(value.id, this[AGGREGATE]);

        await this[REPOSITORY].update(aggregate.applyEvent(value));
    }

}
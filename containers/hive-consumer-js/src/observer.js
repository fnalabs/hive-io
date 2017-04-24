import CONFIG from '../conf/appConfig';

const PROJECTION = Symbol('reference for projection class');
const MODEL = Symbol('reference for query db connection object');
const QUEUE = Symbol('Promise queue for synchronously handling events');


export default class EventObserver {

    constructor(Projection, Model, store) {
        this[PROJECTION] = Projection;
        this[MODEL] = Model;

        this[QUEUE] = Promise.resolve();

        // set handler to listen for messages from the event store consumer
        store.consumer.on('message', this.handle);
    }

    handle = event => {
        this[QUEUE].then(() => this.execute(event));
    }

    execute = async event => {
        const value = JSON.parse(event.value);
        const currentData = (/^create/i).test(value.name) ?
            { id: '', version: 0 } :
            await this[MODEL].findOne({ id: value.id }).exec();

        const projection = new this[PROJECTION](currentData);
        projection.applyEvent(value);

        await this[MODEL]
            .findOneAndUpdate({ id: projection.id }, projection, CONFIG.UPDATE_OPTIONS)
            .exec();
    }

}

// private properties
const COMMAND = Symbol('reference to Command class');
const EVENT = Symbol('reference to Event class');


export default class Handler {

    constructor(Command, Event) {
        this[COMMAND] = Command;
        this[EVENT] = Event;
    }

    handle(data, aggregate) {
        const command = new this[COMMAND](data); // eslint-disable-line no-unused-vars
        const event = new this[EVENT](data);

        aggregate.applyData(JSON.parse(JSON.stringify(event)));

        return event;
    }

}

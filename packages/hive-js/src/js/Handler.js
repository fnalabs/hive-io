export const COMMAND = Symbol('reference to Command class');
export const EVENT = Symbol('reference to Event class');

export default class Handler {

    constructor(Command, Event) {
        this[COMMAND] = Command;
        this[EVENT] = Event;
    }

    handle(data, aggregate) {
        const command = new this[COMMAND](data);
        let event;

        if (command.validate() && aggregate.validate(command)) {
            event = this.execute(command);
        }
        return event;
    }

    execute(command) {
        return new this[EVENT](command);
    }

}

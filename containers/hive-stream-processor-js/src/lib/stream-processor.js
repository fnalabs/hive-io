import { Aggregate, Command, Event, Handler } from 'js-cqrs-es';

const commands = {};
const events = {};
const handlers = {};

class StreamProcessor extends Aggregate {

    // TODO

}

// export default Shift class and namespaces for events and handlers
export { StreamProcessor as default, events, handlers };

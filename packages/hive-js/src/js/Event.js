import Message from './Message';


export default class Event extends Message {

    constructor(data) {
        super(data);

        this.timestamp = new Date().toISOString();
    }

}

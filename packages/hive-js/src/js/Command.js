import Message from './Message';


export default class Command extends Message {

    constructor(data) {
        super(data);

        this.validate();
    }

    validate() {}

}

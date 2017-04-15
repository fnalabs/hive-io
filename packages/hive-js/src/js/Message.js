export default class Message {

    constructor(data) {
        this.id = data.id;
        this.sequence = data.sequence;
    }

    toJSON() {
        return {
            ...this,
            name: this.constructor.name
        };
    }

}

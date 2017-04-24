import { Aggregate, Schema } from 'js-cqrs-es';

const schema = new Schema({
    id: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    content: String,
    // metadata
    edited: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
});

export default class Post extends Aggregate {

    constructor(data) {
        super(data, schema);
    }

    applyEvent(data) {
        if ((/^(Enabled|Disabled)/).test(data.name)) {
            data.enabled = (/^Enabled/).test(data.name);
        }
        else if ((/^Created/).test(data.name)) {
            data.id = data.postId.id;

            delete data.postId;
        }
        else if ((/^Modified/).test(data.name)) {
            data.edited = true;
        }
        else {
            data.views = this.views + 1;
        }

        super.applyEvent(data);
    }

}

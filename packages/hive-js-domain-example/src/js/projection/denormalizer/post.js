import { Aggregate, Schema } from 'js-cqrs-es';

import contentIdSchema from '../../domain/schema/contentId';

const postSchema = new Schema({
    id: contentIdSchema,
    version: {
        type: Number,
        default: 0
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
        super(data, postSchema);
    }

    applyData(data) {
        if ((/^View/).test(data.name)) {
            this.views++;

            return this;
        }
        else if ((/^(Enabled|Disabled)/).test(data.name)) {
            data.enabled = (/^Enabled/).test(data.name);
        }
        else if ((/^Modified/).test(data.name)) {
            data.edited = true;
        }

        return super.applyData(data);
    }

}

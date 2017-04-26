import { Aggregate, Schema } from 'js-cqrs-es';

import contentIdSchema from '../schema/contentId';

const contentSchema = new Schema({
    id: contentIdSchema,
    version: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        default: '',
        validate: value => {
            if (value.length > 140) {
                throw new RangeError('post is longer than the allowed character limit');
            }
        }
    },
    // metadata
    edited: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    }
});

export default class Content extends Aggregate {

    constructor(data) {
        super(data, contentSchema);
    }

    applyEvent(data) {
        if ((/^(Enable|Disable)/).test(data.name)) {
            data.enabled = (/^Enable/).test(data.name);
        }
        else if ((/^Modify/).test(data.name)) {
            data.edited = true;
        }

        super.applyEvent(data);
    }

}

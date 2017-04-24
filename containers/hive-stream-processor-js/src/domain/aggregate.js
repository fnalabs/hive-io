import uuidV4 from 'uuid/v4';
import { Aggregate, Schema } from 'js-cqrs-es';

import * as events from './events';
import * as handlers from './handlers';

const schema = new Schema({
    id: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true,
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
    },
    // reference(s)
    postId: new Schema()
});

class Content extends Aggregate {

    constructor(data) {
        super(data, schema);
    }

    applyEvent(data) {
        if ((/^(Enable|Disable)/).test(data.name)) {
            data.enabled = (/^Enable/).test(data.name);
        }
        else if ((/^Create/).test(data.name)) {
            data.postId = { id: uuidV4() };
        }
        else {
            data.edited = true;
        }

        super.applyEvent(data);
    }

}

// export default Content class and namespaces for events and handlers
export { Content as default, events, handlers };

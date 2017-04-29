import { Aggregate, Schema } from 'js-cqrs-es';

import contentIdSchema from '../schema/contentId';
import * as commands from './commands';
import * as events from './events';
import * as handlers from './handlers';

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
    },
    views: {
        type: Number,
        default: 0
    }
});

class Content extends Aggregate {

    constructor(data) {
        super(data, contentSchema);
    }

    applyData(data) {
        if ((/^View/).test(data.name)) {
            this.views++;

            return this;
        }
        else if ((/^(Enable|Disable)/).test(data.name)) {
            data.enabled = (/^Enable/).test(data.name);
        }
        else if ((/^Modif/).test(data.name)) {
            data.edited = true;
        }

        return super.applyData(data);
    }

}

// export default Content class and namespaces for commands, events, and handlers
export { Content as default, commands, events, handlers };

import { Model, Schema } from 'js-cqrs-es';

import contentIdSchema from '../schema/contentId';

const viewSchema = new Schema({
    // metadata
    timestamp: {
        type: String,
        value: () => new Date().toISOString()
    },
    // reference(s)
    contentId: contentIdSchema
});

export default class View extends Model {

    constructor(data) {
        super(data, viewSchema);
    }

}

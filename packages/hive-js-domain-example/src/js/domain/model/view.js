import { Model, Schema } from 'js-cqrs-es';

import contentIdSchema from '../schema/contentId';

const viewSchema = new Schema({
    // NOTE: content reference only, not a unique identifier for these objects as this is a Value Object
    id: contentIdSchema,

    // metadata
    timestamp: {
        type: String,
        value: () => new Date().toISOString()
    }
    // NOTE: other analytics data would go here...
});

export default class View extends Model {

    constructor(data) {
        super(data, viewSchema);
    }

}

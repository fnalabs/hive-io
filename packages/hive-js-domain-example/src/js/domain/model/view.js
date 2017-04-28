import { Model, Schema } from 'js-cqrs-es';

import contentIdSchema from '../schema/contentId';

const viewSchema = new Schema({
    // content reference
    id: contentIdSchema

    // other analytics data here...
});

export default class View extends Model {

    constructor(data) {
        super(data, viewSchema);
    }

}

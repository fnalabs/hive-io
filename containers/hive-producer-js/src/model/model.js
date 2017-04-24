import { Model, Schema } from 'js-cqrs-es';

const schema = new Schema({
    // metadata
    timestamp: {
        type: String,
        value: () => new Date().toISOString()
    },
    // reference(s)
    postId: new Schema({
        id: {
            type: String,
            required: true
        }
    })
});

export default class View extends Model {

    constructor(data) {
        super(data, schema);
    }

}

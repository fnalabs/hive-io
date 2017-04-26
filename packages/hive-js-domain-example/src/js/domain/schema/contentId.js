import uuidV4 from 'uuid/v4';
import { Schema } from 'js-cqrs-es';

export default new Schema({
    id: {
        type: String,
        required: true,
        default: uuidV4
    }
});

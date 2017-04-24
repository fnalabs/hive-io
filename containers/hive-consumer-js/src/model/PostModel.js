// imports
import mongoose, { model, Schema } from 'mongoose';

/*
 * class PostSchema
 */
class PostSchema extends Schema {
    constructor() {
        super({
            // beacon info
            id: {
                type: String,
                required: true,
                index: true
            },
            version: {
                type: Number,
                required: true
            },
            content: {
                type: String,
                required: true
            },
            // metadata
            edited: {
                type: Boolean,
                required: true
            },
            enabled: {
                type: Boolean,
                required: true
            },
            views: {
                type: Number,
                default: 0
            }
        }, {
            toJSON: {
                transform(doc, ret) {
                    delete ret._id;
                }
            }
        });
    }
}

export default model.call(mongoose, 'Post', new PostSchema());

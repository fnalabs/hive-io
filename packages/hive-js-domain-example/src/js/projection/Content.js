// imports
import mongoose, { model, Schema } from 'mongoose';

/*
 * class PostSchema
 */
class ContentSchema extends Schema {
    constructor() {
        super({
            id: {
                id: {
                    type: String,
                    required: true,
                    index: true,
                    unique: true
                }
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

export default model.call(mongoose, 'Content', new ContentSchema());

// imports
import { Schema } from 'mongoose';

/*
 * class PostSchema
 */
export default class ContentSchema extends Schema {
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
            toObject: {
                versionKey: false,
                minimize: false,
                transform(doc, ret) {
                    delete ret._id;
                    return ret;
                }
            },
            toJSON: {
                versionKey: false,
                minimize: false,
                transform(doc, ret) {
                    delete ret._id;
                    return ret;
                }
            },
            id: false,
            _id: false
        });
    }
}

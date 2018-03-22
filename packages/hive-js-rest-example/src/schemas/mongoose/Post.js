// imports
import { Schema } from 'mongoose'

/*
 * class PostSchema
 */
export default class PostSchema extends Schema {
  constructor () {
    super({
      _id: {
        type: String,
        required: true
      },
      text: {
        type: String,
        required: true
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
    }, {
      toObject: {
        versionKey: false,
        minimize: false,
        virtuals: true,
        transform (doc, ret) {
          delete ret._id
          return {
            data: ret,
            meta: {
              model: 'Post',
              id: ret.id
            }
          }
        }
      },
      toJSON: {
        versionKey: false,
        minimize: false,
        virtuals: true,
        transform (doc, ret) {
          delete ret._id
          return {
            data: ret,
            meta: {
              model: 'Post',
              id: ret.id
            }
          }
        }
      },
      _id: false
    })
  }
}

// imports
import { Schema } from 'mongoose'

/*
 * class PostSchema
 */
export default class PostSchema extends Schema {
  constructor () {
    super({
      id: {
        type: String,
        required: true,
        index: true,
        unique: true
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
        transform (doc, ret) {
          delete ret._id
          return ret
        }
      },
      toJSON: {
        versionKey: false,
        minimize: false,
        transform (doc, ret) {
          delete ret._id
          return {
            data: ret,
            meta: {
              model: 'Post',
              id: ret.id.id
            }
          }
        }
      },
      id: false,
      _id: false
    })
  }
}

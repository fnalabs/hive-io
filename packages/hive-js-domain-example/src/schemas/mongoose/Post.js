// imports
import { Schema } from 'mongoose'

/*
 * class PostSchema
 */
export default class PostSchema extends Schema {
  constructor () {
    super({
      id: {
        id: {
          type: String,
          required: true,
          index: true,
          unique: true
        }
      },
      content: {
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
          return ret
        }
      },
      id: false,
      _id: false
    })
  }
}

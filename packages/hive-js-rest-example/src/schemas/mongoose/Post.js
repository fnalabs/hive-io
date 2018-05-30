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
      viewed: {
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
            type: 'Post',
            payload: ret
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
            type: 'Post',
            data: ret
          }
        }
      },
      _id: false
    })
  }
}

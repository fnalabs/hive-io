import Schema from 'schema-json-js'

// meta porperties
export const SEQUENCE = Symbol('optional property to cache aggregate sequence')
const SCHEMA = Symbol('Schema object that defines the data model')

// private methods
const CREATE_MODEL = Symbol('method used to create a Model')

// default JSON Schema for JSON API specification Resource Objects
const DefaultSchema = {
  title: 'DefaultModel',
  $id: 'https://hiveframework.io/api/v1/models/DefaultModel',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
}

class Model {
  constructor (data, schema) {
    if (!(data && typeof data === 'object' && !Array.isArray(data))) {
      throw new Error('Model data must be an object')
    }

    if (Number.isInteger(data[SEQUENCE])) this[SEQUENCE] = data[SEQUENCE]
    this[SCHEMA] = schema

    return this[CREATE_MODEL](this, data)
  }

  /*
   * create model
   */
  [CREATE_MODEL] (object, source) {
    // iterate over object/array passed as source data
    const keys = Object.keys(source)
    for (let key of keys) {
      const value = source[key]
      if (value && typeof value === 'object') {
        object[key] = Array.isArray(value)
          ? this[CREATE_MODEL]([], value)
          : this[CREATE_MODEL]({}, value)
      } else object[key] = value
    }

    // return Array instance if in a recursive call
    if (Array.isArray(object)) return object

    // return a proxy to the object to enforce all added properties to be configurable, enumerable, and writable
    return new Proxy(object, {
      defineProperty: (object, property, descriptor) => (object[property] = descriptor.value)
    })
  }

  /*
   * conforms to JSON API specification Top Level
   */
  toJSON () {
    const ret = {
      data: { ...this },
      meta: { timestamp: new Date().toISOString() }
    }

    // add metadata
    if (this[SEQUENCE]) ret.meta.sequence = this[SEQUENCE]
    ret.meta.model = this[SCHEMA].title
    ret.meta.schema = this[SCHEMA].$id || this[SCHEMA].id

    return ret
  }

  /*
   * static methods to allow manual invocation of model validation
   */
  static errors (model) {
    return model[SCHEMA].errors
  }

  static async validate (model) {
    return model[SCHEMA].validate(model)
  }
}

export default class ModelProxy {
  constructor (schema) {
    return new Proxy(Model, {
      construct: async function (Model, argsList) {
        if (schema === undefined) schema = await new Schema(DefaultSchema)
        if (!await schema.validate(argsList[0])) throw new Error(...schema.errors)
        return new Model(argsList[0], schema)
      }
    })
  }
}

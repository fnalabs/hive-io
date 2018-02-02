// meta porperties
export const SEQUENCE = Symbol('optional property to cache aggregate sequence')
const SCHEMA = Symbol('Schema object that defines the data model')

// private methods
const CREATE_MODEL = Symbol('method used to create a Model')

/*
 * Model class
 */
export default class Model {
  constructor (payload, schema) {
    const { data, meta } = payload
    if (!(data && typeof data === 'object' && !Array.isArray(data))) {
      throw new TypeError('Model data must be an object')
    }

    if (meta.model !== schema.title) {
      throw new TypeError('Model metadata does not match Schema name')
    }

    if (Number.isInteger(meta && meta.sequence)) this[SEQUENCE] = meta.sequence

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
      meta: {}
    }

    // add metadata
    if (this[SEQUENCE]) ret.meta.sequence = this[SEQUENCE]
    ret.meta.model = this[SCHEMA].title

    // TODO add this to the meta section in the CommandActor only
    // ret.meta.schema = this[SCHEMA].$id || this[SCHEMA].id

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

// protected porperties
export const VERSION = Symbol('optional property to cache aggregate version')

// private properties
const DESCRIPTORS = Symbol('hash of recognized descriptors ')
const SCHEMA = Symbol('Schema object that defines the data model')

// private methods
const CREATE_MODEL = Symbol('creating a Model')

// constants
const DEFAULT_DESCRIPTORS = {
  configurable: true,
  enumerable: true,
  writable: true
}

/*
 * Model class
 */
export default class Model {
  constructor (payload, schema, descriptors = DEFAULT_DESCRIPTORS) {
    const { data = {}, meta } = payload

    // validate
    if (!(data && typeof data === 'object' && !Array.isArray(data))) {
      throw new TypeError('#Model: data must be an object if defined')
    }

    // init properties
    if (Number.isInteger(meta && meta.version)) this[VERSION] = meta.version
    Object.defineProperties(this, {
      [DESCRIPTORS]: descriptors.immutable ? { value: { immutable: true } } : { value: descriptors },
      [SCHEMA]: { value: schema }
    })

    // parse descriptors and initialize model with data
    const parsedDescriptors = descriptors.immutable ? { enumerable: true } : DEFAULT_DESCRIPTORS
    return this[CREATE_MODEL](this, data, parsedDescriptors)
  }

  /*
   * create model
   */
  [CREATE_MODEL] (object, source, descriptors) {
    // iterate over object/array passed as source data
    const keys = Object.keys(source)
    for (let key of keys) {
      const value = source[key]
      if (value && typeof value === 'object') {
        Object.defineProperty(object, key, {
          ...descriptors,
          value: Array.isArray(value)
            ? this[CREATE_MODEL]([], value, descriptors)
            : this[CREATE_MODEL]({}, value, descriptors)
        })
      } else Object.defineProperty(object, key, { ...descriptors, value })
    }

    // check if descriptor specifies immutable
    if (this[DESCRIPTORS].immutable) return Object.freeze(object)
    else {
      // return Array instance if in a recursive call
      if (Array.isArray(object)) return object

      // return a proxy to the object to enforce all added properties to use model descriptors
      return new Proxy(object, {
        defineProperty: (object, property, descriptor) =>
          typeof property === 'symbol'
            ? Object.defineProperty(object, property, { value: descriptor.value })
            : Object.defineProperty(object, property, { ...descriptors, value: descriptor.value })
      })
    }
  }

  /*
   * conforms to JSON API specification Top Level
   */
  toJSON () {
    const ret = { meta: {} }

    // add data
    if (Object.keys(this).length) ret.data = { ...this }

    // add metadata
    if (this[VERSION]) ret.meta.version = this[VERSION]
    ret.meta.model = this[SCHEMA].title

    return ret
  }

  /*
   * static methods to allow manual invocation of model validation
   */
  static schema (model) {
    return model[SCHEMA]
  }

  static errors (model) {
    return model[SCHEMA].errors
  }

  static async validate (model, schema) {
    return model[SCHEMA].validate(model, schema || model[SCHEMA])
  }
}

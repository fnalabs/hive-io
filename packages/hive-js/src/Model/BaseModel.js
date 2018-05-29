// protected porperties
export const VERSION = Symbol('optional property to cache aggregate version')

// "private" properties
const DESCRIPTORS = Symbol('hash of recognized descriptors')
const SCHEMA = Symbol('Schema object that defines the data model')

// "private" methods
const CREATE_MODEL = Symbol('creating a Model')

// constants
const DEFAULT_DESCRIPTORS = {
  configurable: true,
  enumerable: true,
  writable: true
}

/**
 * Factory class to generate `Model` instances against their JSON Schema definitions. This class adheres to the Flux Standard Action (FSA) specification and generates FSA representations of itself when transfromed to JSON. Likewise, it expects `data` to be provided in the same structure. It implements a similar pattern to Object property descriptors allowing you to set whether the Model instance's properties are `configurable`, `enumerable`, and/or `writable`. It adds another descriptor, `immutable`, to allow for the creation of immutable instances of a Model.
 * @class
 * @name Model
 * @param {Object} data - A FSA Object literal containing the Model's `type` and optional `meta` and `payload`.
 * @param {Object} schema - An Object literal containing the JSON Schema definition of the Model.
 * @param {Object} [refs] - An optional Object literal of cached JSON Schema definitions referenced in the main schema.
 * @param {Object} [descriptors={configurable:true,enumerable:true,writable:true}] - An optional Object literal containing the desired property descriptors for the Model instance.
 */
export default class Model {
  constructor (data, schema, descriptors = DEFAULT_DESCRIPTORS) {
    const { type, payload = {}, meta } = data

    // validate
    if (!(payload && typeof payload === 'object' && !Array.isArray(payload))) {
      throw new TypeError('#Model: payload must be an object if defined')
    }
    if (schema.title && type !== schema.title) {
      throw new TypeError('#Model: data type does not match Schema')
    }

    // init properties
    if (Number.isInteger(meta && meta.version)) this[VERSION] = meta.version
    Object.defineProperties(this, {
      [DESCRIPTORS]: descriptors.immutable ? { value: { immutable: true } } : { value: descriptors },
      [SCHEMA]: { value: schema }
    })

    // parse descriptors and initialize model with payload
    const parsedDescriptors = descriptors.immutable ? { enumerable: true } : descriptors
    return this[CREATE_MODEL](this, payload, parsedDescriptors)
  }

  /**
   * @private
   * Method used to iteratively assign data to the model.
   * @param {Object} object - Recursive reference to the Model instance as data is assigned.
   * @param {Object} source - Recursive reference to the source data being assigned to the Model instance.
   * @param {Object} descriptors - An Object literal containing the descriptors to attach to the Model instance's properties along with its associated data.
   * @returns {Object} The Model instance with all of the assigned data.
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

  /**
   * Method used to transform the Model instance to conform to the FSA specification standard action definition.
   * @returns {Object} An Object literal containing the `meta` and optional `data` of the Model instance.
   */
  toJSON () {
    const ret = { type: this[SCHEMA].title }

    // add data
    if (Object.keys(this).length) ret.payload = { ...this }

    // add metadata
    if (this[VERSION]) ret.meta = {version: this[VERSION]}

    return ret
  }

  /**
   * Static method to get the version associated with the instance of a Model.
   * @param {Model} model - The Model instance.
   * @returns {Number|undefined} - The version of the Model instance.
   */
  static version (model) {
    return model[VERSION]
  }

  /**
   * Static method to get the JSON Schema instance associated with the instance of a Model.
   * @param {Model} model - The Model instance.
   * @returns {Schema} - The associated JSON Schema instance.
   */
  static schema (model) {
    return model[SCHEMA]
  }

  /**
   * Static method to get the List of errors from the last time `validate` was called on the associated JSON Schema instance from the Model instance.
   * @param {Model} model - The Model instance.
   * @returns {Array<string>} The List of errors.
   */
  static errors (model) {
    return model[SCHEMA].errors
  }

  /**
   * [`async`] Static method to manually run the JSON Schema instance's `validate` method on the specified Model instance. This method will also perform partial schema validation if passed as the second parameter.
   * @param {Model} model - The Model instance.
   * @param {Schema} [schema] - An optional JSON Schema instance.
   * @returns {boolean} `true` if validation is successful, otherwise `false`.
   */
  static async validate (model, schema) {
    return model[SCHEMA].validate(model, schema || model[SCHEMA])
  }
}

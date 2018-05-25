// imports
import Schema from 'schema-json-js'

import { parse } from '../util'
import Model from '../Model'

// "private" properties
const URL = Symbol('Actor URL template')
export const MODEL = Symbol('Model schema')

/**
 * Class that implements a basic <a href="https://en.wikipedia.org/wiki/Actor_model">Actor Model</a> instance. It takes 2 parameters, a parsed template literal representing the Actor's URL and an instance of the associated Model's JSON Schema definition.
 *
 * **NOTE:** The URL template literal passed to the tagged function must start with a slash then the resource name associated with the Model, whether its used or not, as convention.
 * @property {any} repository - A reference to a storage layer type of your choosing or `undefined`.
 * @param {Object} [url=parse`/default/${'defaultId'}`] - The parsed template literal for the Actor's URL.
 * @param {Schema} modelSchema - The instance of the associated Model's JSON Schema definition.
 * @param {any} [repository] - An optional reference to a storage layer type of your choosing.
 * @example <caption>An example Actor class from the <a href="https://github.com/fnalabs/hive-js#examples">README</a>. It is meant to be wrapped with one of the application types (REST, Producer, Consumer, Stream Processor) or to include a connection to the DB of your choice.</caption>
 * import { parse, Actor, Schema } from 'hive-io'
 * import ExampleSchema from '../schemas/ExampleSchema.json'
 *
 * class ExampleActor extends Actor {
 *   async perform (payload) {
 *     // Do something interesting with the payloads this Actor receives here
 *   }
 * }
 * // Proxy<ExampleActor>
 * export default new Proxy(ExampleActor, {
 *   construct: async function (ExampleActor, argsList) {
 *     const example = await new Schema(ExampleSchema)
 *     return new ExampleActor(parse`/example/${'exampleId'}`, example, argsList[0])
 *   }
 * })
 */
export default class Actor {
  constructor (url = parse`/default/${'defaultId'}`, modelSchema, repository) {
    if (!(typeof url === 'object' && !Array.isArray(url))) {
      throw new TypeError('#Actor: url must be an object of parsed values')
    }
    if (!(modelSchema instanceof Schema)) throw new TypeError('#Actor: model schema must be a Schema')

    Object.defineProperties(this, {
      [URL]: { value: url },
      [MODEL]: { value: modelSchema },
      repository: { value: repository }
    })
  }

  /**
   * [`async`] Method that carries out the actions specified in the `data` to the specified `model`.
   * @param {Object} model - An instance of the model associated with the received data generated from `replay`.
   * @param {Object} [data] - An optional FSA Object literal containing the Model's `type` and optional `meta` and `payload`.
   * @returns {Object} An Object literal containing the latest materialized view of the model.
   */
  async perform (model, data) {
    if (typeof model === 'undefined') model = await new Model(data, this[MODEL])
    else if (data && data.payload) {
      model = this.assign(model, data.payload, data.meta)
      if (!(await Model.validate(model))) throw new Error(Model.errors(model)[0])
    }
    return { model }
  }

  /**
   * [`async`] Method that carries out the historical actions or model snapshot specified in the `aggregate`.
   * @param {Object|Array<Object>} aggregate - The historical actions or model snapshot specified.
   * @returns {Object} An Object literal containing the latest materialized view of the model.
   */
  async replay (aggregate) {
    let model
    if (Array.isArray(aggregate)) {
      for (const data of aggregate) {
        const temp = await this.perform(model, data)
        model = temp.model
      }
      return { model }
    }

    return this.perform(model, aggregate)
  }

  /**
   * Method used to generate the materialized view of a specified `model` from specified `payload`. Arrays on the `model` are completely replaced by the provided `payload` currently.
   * @param {Object} model - The instance of a model to receive new data.
   * @param {Object} [payload={}] - The payload to apply to the model.
   * @param {Object} [meta] - The metadata associated with the payload being assigned.
   * @returns {Object} The updated instance of the model.
   */
  assign (model, payload = {}) {
    const keys = Object.keys(payload)
    for (const key of keys) {
      const value = payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])
        ? this.assign({}, payload[key])
        : payload[key]
      model[key] = value
    }
    return model
  }

  /**
   * Method used to parse the specified URL string sent in the HTTP request against the parsed URL object passed in the `constructor` to return an Object literal of URL parameter keys with their associated values.
   * @param {string} url - The URL string sent in the HTTP request.
   * @returns {Object} The Object literal of URL parameter keys with their associated values.
   */
  parse (url) {
    if (this[URL].keys.length === 0) return {}

    const queryIndex = ~url.indexOf('?') ? url.indexOf('?') : undefined
    return url
      .slice(0, queryIndex)
      .split(this[URL].regex)
      .slice(1)
      .reduce((urlParams, param, index) => {
        if (index < this[URL].keys.length) urlParams[this[URL].keys[index]] = param
        return urlParams
      }, {})
  }
}

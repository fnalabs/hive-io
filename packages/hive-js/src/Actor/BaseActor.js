// imports
import Schema from 'schema-json-js'

import { parse } from '../util'
import Model from '../Model'

// "private" properties
const URL = Symbol('Actor URL template')
const MODEL = Symbol('Model schema')

/**
 * Class that implements a basic <a href="https://en.wikipedia.org/wiki/Actor_model">Actor Model</a> instance. It takes 2 parameters, a parsed template literal representing the Actor's URL and an instance of the associated Model's JSON Schema definition.
 * @param {Object} [url=parse`/default/${'defaultId'}`] - The parsed template literal for the Actor's URL.
 * @param {Schema} modelSchema - The instance of the associated Model's JSON Schema definition.
 * @example <caption>An example Actor class from the <a href="https://github.com/fnalabs/hive-js#examples">README</a>. It is meant to be wrapped with one of the application types (REST, Producer, Consumer, Stream Processor) or to include a connection to the DB of your choice.</caption>
 * import { parse, Actor } from 'hive-io'
 *
 * export default class ExampleActor extends Actor {
 *   constructor(exampleSchema) {
 *     super(parse`/example`, exampleSchema) // URLs without parameters still need to be "parsed"
 *   }
 *
 *   async perform (payload) {
 *     // Do something interesting with the payloads this Actor receives here
 *   }
 * }
 */
export default class Actor {
  constructor (url = parse`/default/${'defaultId'}`, modelSchema) {
    if (!(typeof url === 'object' && !Array.isArray(url))) {
      throw new TypeError('#Actor: url must be an object of parsed values')
    }
    if (!(modelSchema instanceof Schema)) throw new TypeError('#Actor: model schema must be a Schema')

    Object.defineProperties(this, {
      [URL]: { value: url },
      [MODEL]: { value: modelSchema }
    })
  }

  /**
   * [`async`] Method that carries out the actions specified in the `payload` to the specified `model`. It can optionally be passed a reference to a `repository` which is usually a transactional cache of the `model`.
   * @param {Object} payload - A valid JSON API Top Level Document structured payload.
   * @param {Object} [model] - An optional instance of the model associated with the payload or `undefined` if performing a create action.
   * @param {Object} [repository] - An optional reference to the transactional cache containing the model and other domain data.
   * @returns {Object} An Object literal containing the latest materialized view of the model.
   */
  async perform (payload, model, repository) {
    if (typeof model === 'undefined') model = await new Model(payload, this[MODEL])
    else {
      model = this.assign(model, payload.data, payload.meta)
      if (!(await Model.validate(model))) throw new Error(Model.errors(model)[0])
    }
    return { model }
  }

  /**
   * [`async`] Method that carries out the historical actions or model snapshot specified in the `aggregate`. It can optionally be passed a reference to a `repository` which is usually a transactional cache of the `aggregate`.
   * @param {Object|Array<Object>} aggregate - The historical actions or model snapshot specified.
   * @param {Object} [repository] - An optional reference to the transactional cache containing the model and other domain data.
   * @returns {Object} The most recent instance of the model.
   */
  async replay (aggregate, repository) {
    if (Array.isArray(aggregate)) {
      let model
      for (const payload of aggregate) {
        const temp = await this.perform(payload, model, repository)
        model = temp.model
      }
      return model
    }

    return new Model(aggregate, this[MODEL])
  }

  /**
   * Method used to generate the materialized view of a specified `model` from specified `data`.
   * @param {Object} model - The instance of a model to receive new data.
   * @param {Object} [data={}] - The data to apply to the model.
   * @returns {Object} The updated instance of the model.
   */
  assign (model, data = {}) {
    const keys = Object.keys(data)
    for (const key of keys) {
      const value = data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])
        ? this.assign({}, data[key])
        : data[key]
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

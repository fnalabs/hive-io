// imports
import Schema from 'schema-json-js'

import { parse } from '../util'
import Model from '../Model'

// private properties
const URL = Symbol('Actor URL template')
const MODEL = Symbol('Model schema')

/*
 * Actor class
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

  /*
   * perform method
   */
  async perform (payload, model, repository) {
    if (typeof model === 'undefined') model = await new Model(payload, this[MODEL])
    else {
      model = this.assign(model, payload.data, payload.meta)
      if (!(await Model.validate(model))) throw new Error(Model.errors(model)[0])
    }
    return { model }
  }

  /*
   * replay method
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

  /*
   * assign method
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

  /*
   * parse method
   */
  parse (url) {
    const queryIndex = ~url.indexOf('?') ? url.indexOf('?') : undefined

    return this[URL].keys.length === 0 ? {}
      : url
        .slice(0, queryIndex)
        .split(this[URL].regex)
        .slice(1)
        .reduce((urlParams, param, index) => {
          if (index < this[URL].keys.length) urlParams[this[URL].keys[index]] = param
          return urlParams
        }, {})
  }
}

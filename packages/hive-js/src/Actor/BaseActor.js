// imports
import { Model } from 'model-json-js'

// "private" properties
export const MODEL = Symbol('Model schema')

/**
 * <p>Class that implements a basic Actor instance in the <a href="https://en.wikipedia.org/wiki/Actor_model">Actor Model</a> pattern. It is essentially a combination of a Controller and Model class from the MVC pattern. It takes 2 optional parameters: an instance of the associated Model's JSON Schema definition and a reference to a downstream repository.</p>
 *
 * <p>Primary use case(s) are:
 * <ul><li>local, atomic domain logic in the <code>perform</code> method</li>
 * <li>pass messages to other actors via internal (System) or external (Kafka) message buses</li>
 * <li>straight forward routing via <code>switch</code>/<code>if</code> conditions for microservices</li></ul></p>
 *
 * <p><strong><em>NOTE:</em></strong> If no parameters are defined, be careful <strong>not</strong> to call inherited methods as they expect the Schema to be defined.</p>
 * @property {any} repository - A reference to a storage layer client of your choosing or <code>undefined</code>.
 * @param {Schema} [modelSchema] - The instance of the associated Model's JSON Schema definition.
 * @param {any} [repository] - An optional reference to a storage layer client of your choosing.
 * @example <caption>An example Actor class. It is meant to be wrapped with one of the microservice types (Base, Producer, Consumer, Stream Processor) or to include a connection to the DB of your choice.</caption>
 * import { Actor, Schema } from 'hive-io'
 * import ExampleSchema from '../schemas/ExampleSchema.json'
 *
 * class ExampleActor extends Actor {
 *   async perform (model, action) {
 *     // Do something interesting with the data
 *   }
 * }
 * // Proxy<ExampleActor>
 * export default new Proxy(ExampleActor, {
 *   construct: async function (ExampleActor, argsList) {
 *     const example = await new Schema(ExampleSchema)
 *     return new ExampleActor(example, argsList[0])
 *   }
 * })
 */
class Actor {
  constructor (modelSchema, repository) {
    Object.defineProperties(this, {
      [MODEL]: { value: modelSchema },
      repository: { value: repository }
    })
  }

  /**
   * Method that carries out the actions specified in the <code>action</code> to the specified <code>model</code>.
   * @param {Object} model - An instance of the model associated with the received data generated from <code>replay</code>.
   * @param {Object} [action] - An optional FSA Object literal containing the Model's <code>type</code> and optional <code>meta</code> and <code>payload</code>.
   * @returns {Object} An Object literal containing the latest materialized view of the model.
   * @async
   */
  async perform (model, action) {
    if (typeof model === 'undefined') model = await new Model(action, this[MODEL])
    else if (action && action.payload) {
      model = this.assign(model, action.payload)
      if (!(await Model.validate(model))) throw new Error(Model.errors(model)[0])
    }
    return { model }
  }

  /**
   * Method that carries out the historical events or model snapshot specified in the <code>aggregate</code>.
   * @param {Object|Array<Object>} aggregate - The historical events or model snapshot specified.
   * @returns {Object} An Object literal containing the latest materialized view of the model.
   * @async
   */
  async replay (aggregate) {
    let model

    // if no historical events or snapshots exist, return empty model
    if (!aggregate) return { model }
    // handle list of historical events replayed on the model
    if (Array.isArray(aggregate)) {
      for (let i = 0, len = aggregate.length; i < len; i++) {
        const temp = await this.perform(model, aggregate[i])
        model = temp.model
      }
      return { model }
    }
    // handle snapshot model instantiation
    return this.perform(model, aggregate)
  }

  /**
   * Method used to generate the materialized view of a specified <code>model</code> from specified <code>payload</code>. Arrays on the <code>model</code> are completely replaced by the provided <code>payload</code> currently.
   * @param {Object} model - The instance of a model to receive new data.
   * @param {Object} [payload={}] - The payload to apply to the model.
   * @returns {Object} The updated instance of the model.
   */
  assign (model, payload = {}) {
    const keys = Object.keys(payload)
    for (let i = 0, len = keys.length; i < len; i++) {
      const value = payload[keys[i]] && typeof payload[keys[i]] === 'object' && !Array.isArray(payload[keys[i]])
        ? this.assign(model[keys[i]] || {}, payload[keys[i]])
        : payload[keys[i]]
      model[keys[i]] = value
    }
    return model
  }
}

export default Actor

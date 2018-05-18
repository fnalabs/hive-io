// imports
import Schema from 'schema-json-js'

import Model from '../Model'
import { VERSION } from '../Model/BaseModel'

import Actor from './BaseActor'

// "private" properties
const COMMAND = Symbol('Command schema')
const EVENT = Symbol('Command schema')

// "private" methods
const ASSERT_VERSION = Symbol('validating and returning new version')

// constants
const immutable = true

/**
 * Class that extends `Actor` with more specific handling of Domain Commands|Events to act upon the Model. It takes 2 additional parameters than the base `Actor`, the Command and Event JSON Schema definitions.
 * @param {Object} [url=parse`/default/${'defaultId'}`] - The parsed template literal for the Actor's URL.
 * @param {Schema} modelSchema - The instance of the associated Model's JSON Schema definition.
 * @param {Schema} eventSchema - The instance of the Actor's associated Event JSON Schema definition.
 * @param {Schema} [commandSchema={}] - The optional instance of the Actor's associated Command JSON Schema definition.
 * @example <caption>An example MessageActor class from the <a href="https://github.com/fnalabs/hive-js#examples">README</a>. It is meant to be wrapped with one of the application types (Producer, Consumer, Stream Processor). Actors wrapped by each of the previously mentioned types are passed references to the centralized log store when `perform` and `replay` methods are called.</caption>
 * import { parse, MessageActor } from 'hive-io'
 *
 * export default class ExampleActor extends MessageActor {
 *   constructor (exampleSchema, eventSchema, commandSchema) {
 *     super(parse`/example/${'exampleId'}`, exampleSchema, eventSchema, commandSchema)
 *   }
 *
 *   async perform (data, modelInstance, repository) {
 *     // Do something interesting with the data against the modelInstance
 *   }
 * }
 */
export default class MessageActor extends Actor {
  constructor (url, modelSchema, eventSchema, commandSchema = {}) {
    super(url, modelSchema)

    if (!(eventSchema instanceof Schema)) throw new TypeError('#MessageActor: event schema must be a Schema')

    Object.defineProperties(this, {
      [EVENT]: { value: eventSchema },
      [COMMAND]: { value: commandSchema }
    })
  }

  /**
   * [`async`] Method that performs the specified Command in the `data` to the specified `modelInstance`. It can optionally be passed a reference to a `repository` which is usually a transactional cache of the `modelInstance`.
   * @param {Object} data - A FSA Object literal containing the Model's `type` and optional `meta` and `payload`.
   * @param {Object} [modelInstance] - An optional instance of the model associated with the data or `undefined` if performing a create action.
   * @param {Object} [repository] - An optional reference to the transactional cache containing the model and other domain data.
   * @returns {Object} An Object literal containing the latest materialized view of the model and the immutable  instances of the command and event.
   */
  async perform (data, modelInstance, repository) {
    // init and validate command and event
    const command = this[COMMAND].title === data.type
      ? await new Model(data, this[COMMAND], { immutable })
      : null
    const event = await new Model({ ...data, type: this[EVENT].title }, this[EVENT], { immutable })

    // call parent perform to init or apply data to model and validate
    const type = Model.schema(modelInstance).title
    const { model } = await super.perform({ ...data, type }, modelInstance, repository)

    // return hash of model instances if everything is successful
    return { command, event, model }
  }

  /**
   * Method used to generate the materialized view of a specified `model` from specified `payload`. It also handles data `version` specified in the `meta` Object literal to optionally assist in optimisted concurrency techniques if set.
   * @param {Object} model - The instance of a model to receive new data.
   * @param {Object} [payload={}] - The payload to apply to the model.
   * @param {Object} [meta] - The meta associated with the data being assigned.
   * @returns {Object} The updated instance of the model.
   */
  assign (model, payload, meta) {
    if (meta && typeof meta.version === 'number') {
      Object.defineProperty(model, VERSION, { value: this[ASSERT_VERSION](meta, model[VERSION]) })
    }
    return super.assign(model, payload)
  }

  /**
   * @private
   * Method used to verify that the data is in the correct sequence before being applied to the model.
   * @param {Object} meta - The meta Object literal associated with the data being assigned.
   * @param {number} version - The current version of the model.
   * @returns {number} The new version to assign to the model.
   */
  [ASSERT_VERSION] (meta, version) {
    if (meta.version !== version + 1) throw new RangeError(`data out of sequence`)
    return meta.version
  }
}

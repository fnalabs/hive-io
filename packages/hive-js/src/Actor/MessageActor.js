// imports
import Schema from 'schema-json-js'

import Model from '../Model'
import { VERSION } from '../Model/BaseModel'

import Actor, { MODEL } from './BaseActor'

// "private" properties
const COMMAND = Symbol('Command schema')
const EVENT = Symbol('Command schema')

// "private" methods
const ASSERT_VERSION = Symbol('validating and returning new version')

// constants
const immutable = true

/**
 * Class that extends `Actor` with more specific handling of Domain Commands|Events to act upon the Model. It takes 2 additional parameters than the base `Actor`, the Command and Event JSON Schema definitions.
 *
 * Primary use case(s) are:
 * - process CQRS Commands to generate Events to apply to a Model in `perform` method
 *
 * ***NOTE:*** The URL template literal passed to the tagged function must start with a slash then the resource name associated with the Model, whether its used or not, as convention.
 * @class
 * @property {any} repository - A reference to a storage layer client of your choosing or `undefined`.
 * @param {Object} [url=parse`/empty`] - The parsed template literal for the Actor's URL.
 * @param {Schema} [modelSchema] - The instance of the associated Model's JSON Schema definition.
 * @param {Schema} eventSchema - The instance of the Actor's associated Event JSON Schema definition.
 * @param {Schema} [commandSchema={}] - The optional instance of the Actor's associated Command JSON Schema definition.
 * @param {any} [repository] - An optional reference to a storage layer client of your choosing.
 * @example <caption>A Command example MessageActor class from the <a href="https://github.com/fnalabs/hive-js#examples">README</a>. It is meant to be wrapped with one of the application types (Producer, Consumer, Stream Processor). Actors wrapped by each of the previously mentioned types are passed references to the centralized log store when `perform` and `replay` methods are called.</caption>
 * import { parse, MessageActor, Schema } from 'hive-io'
 *
 * import ExampleSchema from '../schemas/ExampleSchema.json'
 * import EventSchema from '../schemas/EventSchema.json'
 * import CommandSchema from '../schemas/CommandSchema.json'
 *
 * class CommandActor extends MessageActor {
 *   async perform (data) {
 *     // Do something interesting with the data
 *   }
 * }
 * // Proxy<CommandActor>
 * export default new Proxy(CommandActor, {
 *   construct: async function (CommandActor, argsList) {
 *     const example = await new Schema(ExampleSchema)
 *     const event = await new Schema(EventSchema)
 *     const command = await new Schema(CommandSchema)
 *
 *     return new CommandActor(parse`/example/${'exampleId'}`, example, event, command, argsList[0])
 *   }
 * })
 * @example <caption>An Event example MessageActor class from the <a href="https://github.com/fnalabs/hive-js#examples">README</a>. It is meant to be wrapped with one of the application types (Producer, Consumer, Stream Processor). Actors wrapped by each of the previously mentioned types are passed references to the centralized log store when `perform` and `replay` methods are called.</caption>
 * import { parse, MessageActor, Schema } from 'hive-io'
 *
 * import ExampleSchema from '../schemas/ExampleSchema.json'
 * import EventSchema from '../schemas/EventSchema.json'
 *
 * class EventActor extends MessageActor {
 *   async perform (data) {
 *     // Do something interesting with the data
 *   }
 * }
 * // Proxy<EventActor>
 * export default new Proxy(EventActor, {
 *   construct: async function (EventActor, argsList) {
 *     const example = await new Schema(ExampleSchema)
 *     const event = await new Schema(EventSchema)
 *
 *     return new EventActor(parse`/example/${'exampleId'}`, example, event, undefined, argsList[0])
 *   }
 * })
 */
export default class MessageActor extends Actor {
  constructor (url, modelSchema, eventSchema, commandSchema = {}, repository) {
    super(url, modelSchema, repository)

    if (!(eventSchema instanceof Schema)) throw new TypeError('#MessageActor: event schema must be a Schema')

    Object.defineProperties(this, {
      [EVENT]: { value: eventSchema },
      [COMMAND]: { value: commandSchema }
    })
  }

  /**
   * [`async`] Method that performs the specified Command in the `data` to the specified `model`.
   * @param {Object} model - An instance of the model associated with the received data generated from `replay`.
   * @param {Object} [data] - An optional FSA Object literal containing the Model's `type` and optional `meta` and `payload`.
   * @returns {Object} An Object literal containing the latest materialized view of the model and the immutable  instances of the command and event.
   */
  async perform (model, data) {
    // init and validate command and event
    const command = this[COMMAND].title === data.type
      ? await new Model(data, this[COMMAND], { immutable })
      : null
    const event = await new Model({ ...data, type: this[EVENT].title }, this[EVENT], { immutable })

    // call parent perform to init or apply data to model and validate
    if (this[MODEL] && this[MODEL].title) {
      const type = this[MODEL].title
      await super.perform(model, { ...data, type })
    }

    // return hash of model instances if everything is successful
    return { command, event, model }
  }

  /**
   * Method used to generate the materialized view of a specified `model` from specified `payload`. It also handles data `version` specified in the `meta` Object literal to optionally assist in optimisted concurrency techniques if set.
   * @param {Object} model - The instance of a model to receive new data.
   * @param {Object} [payload={}] - The payload to apply to the model.
   * @param {Object} [meta] - The metadata associated with the payload being assigned.
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

// imports
import Schema from 'schema-json-js'

import Model from '../Model'
import { VERSION } from '../Model/BaseModel'

import Actor from './BaseActor'

// private properties
const COMMAND = Symbol('Command schema')
const EVENT = Symbol('Command schema')

// private methods
const ASSERT_VERSION = Symbol('validating and returning new version')

// constants
const immutable = true

/*
 * MessageActor class
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

  /*
   * perform method
   */
  async perform (payload, model, repository) {
    // init and validate command and event
    const command = this[COMMAND].title === payload.meta.model
      ? await new Model(payload, this[COMMAND], { immutable })
      : null
    const event = await new Model(payload, this[EVENT], { immutable })

    // call parent perform to init or apply data to model and validate
    const result = await super.perform(payload, model, repository)

    // return hash of model instances if everything is successful
    return { command, event, model: result.model }
  }

  /*
   * assign method
   */
  assign (model, data, meta) {
    if (meta && typeof meta.version === 'number') {
      Object.defineProperty(model, VERSION, { value: this[ASSERT_VERSION](meta, model[VERSION]) })
    }
    return super.assign(model, data)
  }

  [ASSERT_VERSION] (meta, version) {
    if (meta.version !== version + 1) throw new RangeError(`${meta.model} out of sequence`)
    return meta.version
  }
}

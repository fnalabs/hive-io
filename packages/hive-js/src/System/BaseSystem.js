// imports
import { Model } from 'model-json-js'

import { Actor } from '../Actor'

// "private" properties
const ON = Symbol('method that binds callbacks to messages')
const EMIT = Symbol('method that sends messages')

// constants
const BROWSER_ENV = typeof global.EventTarget === 'function'

// determine event system
let EventSystem
/* istanbul ignore if */
if (BROWSER_ENV) {
  try {
    new global.EventTarget() // eslint-disable-line no-new
    EventSystem = global.EventTarget
  } catch (e) {
    // EventTargetAdapter because WebKit doesn't allow EventTarget to be created
    const FRAGMENT = Symbol('DocumentFragment')
    EventSystem = class EventTargetAdapter {
      constructor () { this[FRAGMENT] = document.createDocumentFragment() }

      addEventListener (type, listener, options) {
        return this[FRAGMENT].addEventListener(type, listener, options)
      }

      removeEventListener (type, listener, options) {
        return this[FRAGMENT].removeEventListener(type, listener, options)
      }

      dispatchEvent (event) { return this[FRAGMENT].dispatchEvent(event) }
    }
  }
} else {
  EventSystem = require('events')
}

/**
 * Class that implements a Pub/Sub Actor System that works in all modern browsers and Node.js. It is a lightweight interface on top of <code>EventTarget</code> or <code>EventEmitter</code> for browsers and Node.js respectively. The API follows the far more succinct Node.js method names using <code>on</code> to bind Actor callbacks to schema types and <code>emit</code> to send models to any Actors waiting for those events to occur.
 * @example <caption>An example primary Actor using an Actor System to send logs to a supporting Actor for post processing.</caption>
 * import { parse, Actor, Model, Schema, System } from 'hive-io'
 *
 * import ExampleSchema from '../schemas/ExampleSchema.json'
 *
 * import LogActor from '../actors'
 * import LogSchema from '../schemas/LogSchema.json'
 * const logSystem = new System()
 *
 * const LOG_SCHEMA = Symbol('JSON Schema for generating logs')
 *
 * class ExampleActor extends Actor {
 *   constructor(url, schema, logSchema, repository) {
 *     super(url, schema, repository)
 *     this[LOG_SCHEMA] = logSchema
 *   }
 *   async perform (payload) {
 *     // Do something interesting with the payloads this Actor receives here
 *
 *     // fire and forget log
 *     const log = await new Model({ ... }, this[LOG_SCHEMA])
 *     logSystem.emit(log)
 *
 *     // return to process the next request
 *   }
 * }
 * // Proxy<ExampleActor>
 * export default new Proxy(ExampleActor, {
 *   construct: async function (ExampleActor, argsList) {
 *     const example = await new Schema(ExampleSchema)
 *     const log = await new Schema(LogSchema)
 *
 *     const logActor = await new LogActor()
 *     logSystem.on(log.title, logActor)
 *
 *     return new ExampleActor(parse`/example/${'exampleId'}`, example, log, argsList[0])
 *   }
 * })
 */
class System extends EventSystem {
  constructor () {
    super()

    /* istanbul ignore if */
    if (BROWSER_ENV) {
      this[ON] = super.addEventListener
      this[EMIT] = super.dispatchEvent
    } else {
      this[ON] = super.on
      this[EMIT] = super.emit
    }
  }

  /**
   * Method that binds an Actor's <code>perform</code> method to the callback of an event associated with the provided JSON schema <code>title</code>.
   * @param {Schema} schema - An instance of the JSON Schema (or it's raw JSON definition) associated with the the provided Actor.
   * @param {Actor} actor - An instance of an Actor assocated with the provided JSON Schema.
   * @param {Object} [options] - An optional Object literal containing the browser's <code>EventTarget</code> options associated with the event listener.
   * @returns {this} A reference to the System instance so that additional event listeners can be chained.
   */
  on (schema, actor, options) {
    if (!schema || typeof schema.title !== 'string') throw new TypeError('#on: schema.title must be a string')
    if (!(actor instanceof Actor)) throw new TypeError('#on: actor is not an Actor')

    /* istanbul ignore if */
    if (BROWSER_ENV) this[ON](schema.title, event => actor.perform(event.detail), options)
    else this[ON](schema.title, actor.perform.bind(actor))

    return this
  }

  /**
   * Method that emits a <code>model</code> instance to all Actors listening to the model's type.
   * @param {Model} model - An instance of the model to be sent to all Actors listening.
   */
  emit (model) {
    if (!(model instanceof Model)) throw new TypeError('#emit: model is not a Model')

    const schema = Model.schema(model)
    /* istanbul ignore if */
    if (BROWSER_ENV) {
      const event = new global.CustomEvent(schema.title, { detail: model })
      return this[EMIT](event)
    } else return this[EMIT](schema.title, model)
  }
}

export default System

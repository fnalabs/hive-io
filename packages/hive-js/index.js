// expose library
const { Actor, MessageActor } = require('./dist/Actor')
exports.Actor = Actor
exports.MessageActor = MessageActor

const { Model, Schema } = require('model-json-js')
exports.Model = Model
exports.Schema = Schema

const System = require('./dist/System')
exports.System = System
exports.Bus = System

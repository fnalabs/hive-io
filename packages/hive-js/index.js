// expose library
const { Actor, MessageActor } = require('./dist/Actor')
exports.Actor = Actor
exports.MessageActor = MessageActor

const { Model, Schema } = require('model-json-js')
exports.Model = Model
exports.Schema = Schema

exports.System = require('./dist/System')

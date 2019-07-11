// expose library
const { Actor, MessageActor } = require('./dist/Actor')
exports.Actor = Actor
exports.MessageActor = MessageActor

const { VERSION, Model, Schema } = require('model-json-js')
exports.VERSION = VERSION
exports.Model = Model
exports.Schema = Schema

exports.System = require('./dist/System')

exports.parse = require('./dist/util').parse

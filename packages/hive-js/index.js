// expose library
const actors = require('./dist/Actor')
exports.Actor = actors.Actor
exports.MessageActor = actors.MessageActor

exports.Model = require('./dist/Model')
exports.Schema = require('schema-json-js')

exports.parse = require('./dist/util').parse

// imports
import Schema from 'schema-json-js'

import Model from './BaseModel'

// constants
// default JSON Schema
const EmptySchema = {}

/*
 * Proxy<Model> for async initialization of the schema and validation of data on construction
 */
export default new Proxy(Model, {
  construct: async function (Model, argsList) {
    // init optional refs and descriptors
    let descriptors = argsList[3]
    let refs = argsList[2]
    if (refs && typeof refs === 'object' && !Array.isArray(refs) && !Object.keys(refs)[0].indexOf('http') !== 0) {
      descriptors = refs
      refs = undefined
    }

    // init schema
    let schema = argsList[1]
    if (!(schema && typeof schema === 'object')) schema = await new Schema(EmptySchema)
    else if (!(schema instanceof Schema)) schema = await new Schema(schema, refs)

    // validate data and return new Model
    const data = argsList[0]
    if (!(data && typeof data === 'object' && !Array.isArray(data))) {
      throw new TypeError('Model data must be an object')
    }
    if (!await schema.validate(data.payload)) throw new Error(...schema.errors)

    return new Model(data, schema, descriptors)
  }
})

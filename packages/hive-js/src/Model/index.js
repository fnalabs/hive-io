// imports
import Schema from 'schema-json-js'

import Model from './BaseModel'

// constants
// default JSON Schema for JSON API specification Resource Objects
const DefaultSchema = {
  title: 'Default',
  $id: 'https://hiveframework.io/api/v1/models/Default',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
}

/*
 * Proxy<Model> for async initialization of the schema and validation of payload on construction
 */
export default new Proxy(Model, {
  construct: async function (Model, argsList) {
    // init schema
    let schema = argsList[1]
    if (!(schema && typeof schema === 'object')) schema = await new Schema(DefaultSchema)
    else if (!(schema instanceof Schema)) schema = await new Schema(schema)

    // validate data and return new Model
    const payload = argsList[0]
    if (!(payload && typeof payload === 'object' && !Array.isArray(payload))) {
      throw new TypeError('Model payload must be an object')
    }
    if (!await schema.validate(payload.data)) throw new Error(...schema.errors)

    return new Model(payload, schema)
  }
})

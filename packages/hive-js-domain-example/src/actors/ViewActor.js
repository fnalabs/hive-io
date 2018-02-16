// imports
import { parse, Actor, Schema } from 'hive-io'

import ViewSchema from '../schemas/json/View.json'
import ContentIdSchema from '../schemas/json/content/ContentId.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class ViewActor
 */
class ViewActor extends Actor {
  constructor (viewSchema) {
    super(parse`/view/${'contentId'}`, viewSchema)
  }
}

/*
 * Proxy<ViewActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(ViewActor, {
  construct: async function (ViewActor) {
    const viewSchema = await new Schema(ViewSchema, REFS)
    return new ViewActor(viewSchema)
  }
})

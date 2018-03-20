// imports
import { parse, Actor, Schema } from 'hive-io'

import ViewSchema from '../schemas/json/View.json'
import PostIdSchema from '../schemas/json/post/PostId.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/PostId': PostIdSchema
}

/*
 * class ViewActor
 */
class ViewActor extends Actor {
  constructor (viewSchema) {
    super(parse`/view/${'postId'}`, viewSchema)
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

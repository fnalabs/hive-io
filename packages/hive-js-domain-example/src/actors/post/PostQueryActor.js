// imports
import { parse, Actor, Schema } from 'hive-io'

import PostSchema from '../schemas/json/content/Post.json'
import ContentIdSchema from '../schemas/json/content/ContentId.json'

// constants
const REFS = {
  'https://hiveframework.io/api/v1/models/ContentId': ContentIdSchema
}

/*
 * class PostQueryActor
 */
class PostQueryActor extends Actor {
  constructor (postSchema) {
    super(parse`/post/${'postId'}`, postSchema)
  }

  async perform (payload) {
    // TODO: implement query handling logic here
  }
}

/*
 * Proxy<PostQueryActor> for async initialization of the Schema w/ refs
 */
export default new Proxy(PostQueryActor, {
  construct: async function (PostQueryActor) {
    // TODO: add connection to MongoDB here for query retreival

    const postSchema = await new Schema(PostSchema, REFS)
    return new PostQueryActor(postSchema)
  }
})

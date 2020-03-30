import mongoose from 'mongoose'

import { MONGO_URL } from '../config'

export default async function mongoConnect () {
  return new Promise((resolve, reject) => {
    mongoose.connection
      .on('error', error => reject(error))
      .on('close', () => console.log('Database connection closed.')) // eslint-disable-line no-console
      .once('open', () => resolve(mongoose))

    mongoose.connect(MONGO_URL, { useFindAndModify: false })
  })
}

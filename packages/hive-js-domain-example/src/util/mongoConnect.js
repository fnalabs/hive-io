import mongoose from 'mongoose'

export default async function mongoConnect () {
  return new Promise((resolve, reject) => {
    mongoose.connection
      .on('error', error => reject(error))
      .on('close', () => console.log('Database connection closed.')) // eslint-disable-line no-console
      .once('open', () => resolve(mongoose))

    mongoose.connect('mongodb://hive-consumer-js-db:27017/post')
  })
}

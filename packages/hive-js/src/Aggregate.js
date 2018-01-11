import Model from './Model'

const SET_VERSION = Symbol('reference to method for validating and setting aggregate version')

export default class Aggregate extends Model {
  constructor (data = {}, spec) {
    super(data, spec)
  }

  /*
   * apply methods
   */
  applyData (data) {
    if (typeof data.version !== 'number') data.version = this[SET_VERSION](data)

    return this.update(data)
  }

  applySequence (data) {
    return data.reduce((ret, log) => {
      log.version = log.sequence

      return this.applyData(log)
    }, this)
  }

  [SET_VERSION] (data) {
    if (data.sequence !== this.version + 1) throw new RangeError(`${data.name} out of sequence`)

    return data.sequence
  }
}

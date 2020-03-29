/* eslint-env mocha */
// imports
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import { parse } from '../src/util'

chai.use(dirtyChai)

describe('#parse', () => {
  it('should parse a simple template literal successfully', () => {
    expect(parse`/test/${'testId'}`).to.deep.equal({ regex: /\/test\/?/, keys: ['testId'] })
  })

  it('should parse a complex template literal successfully', () => {
    expect(parse`/test/${'testId'}/child/${'childId'}`).to.deep.equal({ regex: /\/test\/?|\/child\/?/, keys: ['testId', 'childId'] })
  })

  it('should error when omitting a resource name', () => {
    expect(() => parse`${'testId'}/child`).to.throw('url template must begin with a slash (/) and a name')
  })

  it('should error when using non-string values in template literal keys', () => {
    expect(() => parse`/test/${1}`).to.throw('url param keys must be strings')
  })
})

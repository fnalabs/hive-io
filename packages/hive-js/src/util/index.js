/**
 * <p>Tagged template function to parse template literals representing a URL string with optional parameters.</p>
 *
 * <p><strong><em>NOTE:</em></strong> The URL template literal passed to the tagged function must start with a slash then the resource name associated with the Model, whether its used or not, as convention.</p>
 * @function
 * @name parse
 * @param {Array<string>} strings - List of strings from the template literal in order of occurence.
 * @param {Array<string>} keys - List of URL parameter keys defined to associated parsed values with.
 * @returns {Object} An Object literal containing a <code>regex</code> object to parse URL strings and the List of <code>keys</code>.
 * @example
 * parse`/resource` // URLs without defined parameters are returned immediately when each request is parsed.
 * @example
 * parse`/resource/${'resourceId'}` // The string inside the curly brackets defines the URL parameter `key`.
 */
export function parse (strings, ...keys) {
  if (/^[/ ]?$/.test(strings[0])) throw new Error('url template must begin with a slash (/) and a name')
  for (let i = 0, len = keys.length; i < len; i++) {
    if (typeof keys[i] !== 'string') throw new TypeError('url param keys must be strings')
  }

  if (strings[strings.length - 1] === '') strings = strings.slice(0, -1)

  // check the last character of the last string in the 'strings' array
  const regex = strings[strings.length - 1][strings[strings.length - 1].length - 1] === '/'
    ? new RegExp(`${strings.join('?|')}?`)
    : new RegExp(strings.join('?|'))

  return { regex, keys }
}

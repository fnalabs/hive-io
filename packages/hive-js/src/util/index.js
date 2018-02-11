// parse function for string template literals representing a template for url params
export function parse (strings, ...keys) {
  if (/^[/ ]?$/.test(strings[0])) throw new Error('url template must begin with a slash (/) and a name')
  for (const key of keys) if (typeof key !== 'string') throw new TypeError('url param keys must be strings')

  if (strings[strings.length - 1] === '') strings = strings.slice(0, -1)
  const regex = new RegExp(strings.join('|'))

  return { regex, keys }
}

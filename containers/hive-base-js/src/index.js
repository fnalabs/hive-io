// imports
import CONFIG from '../conf/appConfig'

// constants
const pingUrlRegExp = new RegExp(`^${CONFIG.PING_URL}$`)
const contentTypeRegExp = new RegExp(`^${CONFIG.CONTENT_TYPE}`)

// helper functions
export async function json (req) {
  let buffer = ''
  let complete = false

  req.setEncoding('utf8')

  return new Promise((resolve, reject) => {
    function done (data, err) {
      complete = true

      onClose()

      if (data) return resolve(data)
      else if (err) return reject(err)
      else return reject(new Error('something unexpected happened'))
    }

    // event handlers
    function onAborted () {
      if (complete) return

      done(null, new Error('request was aborted'))
    }
    function onClose () {
      buffer = null

      req.removeListener('aborted', onAborted)
      req.removeListener('close', onClose)
      req.removeListener('data', onData)
      req.removeListener('end', onEnd)
      req.removeListener('error', onEnd)
    }
    function onData (chunk) {
      if (complete) return
      buffer += chunk
    }
    function onEnd (err) {
      if (complete) return

      if (err) return done(null, err)

      try {
        done(JSON.parse(buffer))
      } catch (e) {
        done(null, e)
      }
    }

    req.on('aborted', onAborted)
    req.on('close', onClose)
    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onEnd)
  })
}

export function send (res, status = 200, model = null) {
  if (model === null) {
    res.writeHead(status, { 'Content-Type': 'text/plain' })
    res.end()
  } else {
    const str = JSON.stringify(model)

    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(str)
    })
    res.end(str)
  }
}

// export main
export default async function main () {
  // init dependencies
  const Actor = await require(CONFIG.ACTOR_LIB)[CONFIG.ACTOR]
  const actor = await new Actor()

  // router for microservice
  return async function route (req, res) {
    if (pingUrlRegExp.test(req.url)) return send(res, 200)

    try {
      // construct data with parsed request data for query processing
      let data = req.method !== 'GET' && contentTypeRegExp.test(req.headers['content-type'])
        ? await json(req)
        : {}

      // set payload/meta if not previously set
      if (Object.keys(data).length && !(data.payload || data.meta)) {
        data = { payload: data, meta: { req } }
      } else {
        data.meta.req = req
      }

      // call Actor to perform on request
      const { model } = await actor.perform(undefined, data)

      return send(res, 200, model)
    } catch (e) {
      return send(res, e.statusCode || 400, { errors: [e.message] })
    }
  }
}

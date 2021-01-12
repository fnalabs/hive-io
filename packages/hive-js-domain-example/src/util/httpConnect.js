import fs from 'fs'
import http from 'http2'

import { SECURE, SSL_CERT, VIEW_URL } from '../config'

// initialize http options
const options = {}
if (SECURE) options.ca = SSL_CERT[0] === '/' ? fs.readFileSync(SSL_CERT) : SSL_CERT

export default function httpConnect () {
  return http.connect(VIEW_URL, options)
}

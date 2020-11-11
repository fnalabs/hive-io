import fs from 'fs'
import http from 'http2'

import { SSL_CERT, VIEW_URL } from '../config'

export default function httpConnect () {
  return http.connect(VIEW_URL, {
    ca: SSL_CERT[0] === '/' ? fs.readFileSync(SSL_CERT) : SSL_CERT
  })
}

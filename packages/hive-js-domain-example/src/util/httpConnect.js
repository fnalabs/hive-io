import fs from 'fs'
import http from 'http2'

import { SSL_CERT_PATH, VIEW_URL } from '../config'

export default function httpConnect () {
  return http.connect(VIEW_URL, {
    ca: fs.readFileSync(SSL_CERT_PATH)
  })
}

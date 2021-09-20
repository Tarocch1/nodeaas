import http from 'http'
import { logger } from './'

export type THttpPayload = Pick<
  http.IncomingMessage,
  | 'aborted'
  | 'httpVersion'
  | 'httpVersionMajor'
  | 'httpVersionMinor'
  | 'complete'
  | 'headers'
  | 'rawHeaders'
  | 'trailers'
  | 'rawTrailers'
  | 'method'
  | 'url'
> & {
  body: Buffer
}

export function getPayload(
  request: http.IncomingMessage
): Promise<THttpPayload> {
  return new Promise((resolve, reject) => {
    const payload: THttpPayload = {
      aborted: request.aborted,
      httpVersion: request.httpVersion,
      httpVersionMajor: request.httpVersionMajor,
      httpVersionMinor: request.httpVersionMinor,
      complete: request.complete,
      headers: request.headers,
      rawHeaders: request.rawHeaders,
      trailers: request.trailers,
      rawTrailers: request.rawTrailers,
      method: request.method,
      url: request.url,
      body: Buffer.from([]),
    }
    const body = []
    request
      .on('error', (e) => {
        logger.log(`getPayload error. ${e}`, {
          url: request.url,
          stack: e.stack,
        })
        reject(e)
      })
      .on('data', (chunk) => {
        body.push(chunk)
      })
      .on('end', () => {
        payload.body = Buffer.concat(body)
        resolve(payload)
      })
  })
}

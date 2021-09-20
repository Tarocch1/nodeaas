import http from 'http'
import { URLSearchParams } from 'url'
import { logger } from './'

export type TBody = Record<string, unknown> | Buffer
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
  ip: string
  ips: string[]
  body: TBody
}

export async function getPayload(
  request: http.IncomingMessage
): Promise<THttpPayload> {
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
    ip: '',
    ips: [],
    body: Buffer.from([]),
  }

  const [ip, ips] = getIp(request)
  payload.ip = ip
  payload.ips = ips

  payload.body = await getBody(request)

  return payload
}

function getIp(request: http.IncomingMessage): [string, string[]] {
  let ip = '',
    ips = []

  const socket = request.socket
  if (socket.remoteAddress) {
    ip = socket.remoteAddress
    ips = [socket.remoteAddress]
  }

  if (request.headers['x-forwarded-for']) {
    const xForwardedFor = request.headers['x-forwarded-for'] as string
    ips = xForwardedFor.split(', ')
    ip = ips[0]
  }

  return [ip, ips]
}

function getBody(request: http.IncomingMessage): Promise<TBody> {
  return new Promise((resolve, reject) => {
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
        const buffer = Buffer.concat(body)
        resolve(decodeBody(buffer, request))
      })
  })
}

function decodeBody(buffer: Buffer, request: http.IncomingMessage): TBody {
  try {
    const contentType = request.headers['content-type']
    if (contentType) {
      if (contentType.includes('application/json')) {
        const str = buffer.toString()
        return JSON.parse(str)
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const str = buffer.toString()
        const urlSearchParams = new URLSearchParams(str)
        const result = {}
        urlSearchParams.forEach((value, key) => {
          if (result[key]) {
            result[key] = [result[key], value].flat()
          } else {
            result[key] = value
          }
        })
        return result
      }
    }
    return buffer
  } catch (e) {
    return buffer
  }
}

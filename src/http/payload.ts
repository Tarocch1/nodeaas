import http from 'http'
import { URLSearchParams } from 'url'
import { logger } from '@src/http'
import { THttpCtx, THttpPayload, THttpBody } from '@type/http.type'

export async function getPayload(ctx: THttpCtx): Promise<THttpCtx> {
  if (ctx.response.writableEnded) return ctx
  const { requestID, request } = ctx
  const payload: THttpPayload = {
    requestID,
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

  const [ip, ips] = getIp(ctx)
  payload.ip = ip
  payload.ips = ips
  payload.body = await getBody(ctx)

  logger.log('http function payload.', {
    requestID,
    url: request.url,
    payload,
  })

  ctx.payload = payload
  return ctx
}

function getIp(ctx: THttpCtx): [string, string[]] {
  const { request } = ctx
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

function getBody(ctx: THttpCtx): Promise<THttpBody> {
  return new Promise((resolve, reject) => {
    const { requestID, request } = ctx
    const body = []
    request
      .on('error', (e) => {
        logger.log(`getPayload error. ${e}`, {
          requestID,
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

function decodeBody(buffer: Buffer, request: http.IncomingMessage): THttpBody {
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

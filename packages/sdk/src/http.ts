import http from 'http'
import { handle } from './handle'

export type THttpBody = Record<string, unknown> | Buffer
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
  requestID: string
  ip: string
  ips: string[]
  body: THttpBody
  jwt?: Record<string, unknown>
}

export type THttpResult = {
  statusCode?: number
  headers?: Record<string, string | string[]>
  jwt?: Record<string, unknown>
  body?: string | Buffer
}

export function handleHttp(
  handler: (payload: THttpPayload) => THttpResult | Promise<THttpResult>
): void {
  handle(handler)
}

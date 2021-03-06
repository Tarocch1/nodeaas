import http from 'http'
import { CookieSerializeOptions } from 'cookie'

export type THttpFunctionConfig = {
  name: string
  module: string
  path: RegExp
  method?: string
  timeout?: number
  jwt?: JWT_METHOD
  cors?: Record<string, string | string[]>
}

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

export type THttpCtx = {
  requestID: string
  request: http.IncomingMessage
  response: http.ServerResponse
  payload?: THttpPayload
  config?: THttpFunctionConfig
  result?: THttpResult
}

export type TJwtConfig = {
  key: string
  location: JWT_LOCATION
  name: string
  cookie: CookieSerializeOptions
}

export type THttpConfig = {
  port: number
  host: string
  prefix: string
  jwt?: TJwtConfig
  cors?: Record<string, string | string[]>
}

export enum JWT_LOCATION {
  Cookie = 'cookie',
  Header = 'header',
  Param = 'param',
}

export enum JWT_METHOD {
  Sign = 'sign',
  Verify = 'verify',
  Refresh = 'refresh',
}

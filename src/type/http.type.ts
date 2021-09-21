import http from 'http'

export type THttpFunctionConfig = {
  name: string
  module: string
  path: RegExp
  timeout?: number
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
  ip: string
  ips: string[]
  body: THttpBody
}

export type THttpResult = {
  statusCode?: number
  headers?: NodeJS.Dict<string | string[]>
  body?: string | Buffer
}

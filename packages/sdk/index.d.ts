/// <reference types="node" />
import http from 'http'
// import { Serializable } from 'child_process'

export declare type THttpBody = Record<string, unknown> | Buffer
export declare type THttpPayload = Pick<
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
export declare type THttpResult = {
  statusCode?: number
  headers?: Record<string, string | string[]>
  jwt?: Record<string, unknown>
  body?: string | Buffer
}

export declare type TCronPayload = {
  time: Date
}

export declare function handle(
  handler: (payload: THttpPayload) => THttpResult | Promise<THttpResult>
): void
export declare function handle(
  handler: (payload: TCronPayload) => void | Promise<void>
): void

// declare class Service {
//   constructor(name: string)
//   private name
//   call(data: Serializable): Promise<Serializable>
// }

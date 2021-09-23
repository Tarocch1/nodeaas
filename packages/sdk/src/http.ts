import http from 'http'

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
  jwt?: Record<string, unknown>
}

export type THttpResult = {
  statusCode?: number
  headers?: NodeJS.Dict<string | string[]>
  jwt?: Record<string, unknown>
  body?: string | Buffer
}

export function handleHttp(
  handler: (payload: THttpPayload) => THttpResult | Promise<THttpResult>
): void {
  process.on('message', (payload) => {
    const result = handler(payload as THttpPayload)
    const p = result instanceof Promise ? result : Promise.resolve(result)
    p.then((r) => {
      process.send(r)
      process.disconnect()
    })
  })
}

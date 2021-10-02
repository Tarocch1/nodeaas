import { THttpResult } from '@type/http.type'

export function setHeaders(
  result: THttpResult,
  headers: Record<string, string | string[]> | undefined
): void {
  if (!result.headers) result.headers = {}
  Object.entries(headers).forEach(([key, value]) => {
    if (result.headers[key]) {
      if (Array.isArray(result.headers[key])) {
        ;(result.headers[key] as string[]).push(...[value].flat())
      } else {
        result.headers[key] = [result.headers[key] as string, ...[value].flat()]
      }
    } else {
      result.headers[key] = value
    }
  })
}

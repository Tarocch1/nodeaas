import { config as globalConfig } from '@src/lib/config'
import { logger } from '@src/http'
import { setHeaders } from '@src/http/utils'
import { THttpCtx } from '@type/http.type'

export function cors(ctx: THttpCtx): THttpCtx {
  if (ctx.response.writableEnded) return ctx
  const headers = ctx.config.cors || globalConfig.config.http.cors
  if (ctx.result) {
    // 函数运行之后 加入 cors 头
    afterHandler(ctx, headers)
  } else {
    // 函数运行之前 处理 OPTIONS 请求
    beforeHandler(ctx, headers)
  }
  return ctx
}

function beforeHandler(
  ctx: THttpCtx,
  headers: Record<string, string | string[]> | undefined
): void {
  const { payload, response, config } = ctx
  if (config.method !== 'OPTIONS' && payload.method === 'OPTIONS') {
    logger.log(`cors OPTIONS handled.`, {
      url: payload.url,
      headers,
    })
    response.statusCode = headers ? 200 : 404
    Object.entries(headers || {}).forEach(([key, value]) => {
      response.setHeader(key, value)
    })
    response.end()
  }
}

function afterHandler(
  ctx: THttpCtx,
  headers: Record<string, string | string[]> | undefined
): void {
  const { result } = ctx
  setHeaders(result, headers || {})
}

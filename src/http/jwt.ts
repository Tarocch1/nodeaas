import { URL } from 'url'
import { serialize, parse } from 'cookie'
import crypto from 'crypto'
import dayjs from 'dayjs'
import { config as globalConfig } from '@src/lib/config'
import { logger } from '@src/http'
import { setHeaders } from '@src/http/utils'
import { THttpCtx, JWT_METHOD, JWT_LOCATION } from '@type/http.type'

export function handleJwt(ctx: THttpCtx): THttpCtx {
  if (ctx.response.writableEnded) return ctx
  if (!globalConfig.config.http.jwt) return ctx
  if (!ctx.config.jwt) return ctx
  if (ctx.result) {
    // 函数运行之后
    afterHandler(ctx)
  } else {
    // 函数运行之前
    beforeHandler(ctx)
  }
  return ctx
}

function beforeHandler(ctx: THttpCtx): void {
  const { requestID, payload, response, config } = ctx
  switch (config.jwt) {
    case JWT_METHOD.Verify:
    case JWT_METHOD.Refresh:
      if (!verify(ctx)) {
        logger.log(`jwt verify fail.`, {
          requestID,
          url: payload.url,
        })
        response.statusCode = 401
        response.end()
      }
      break
    default:
      break
  }
}

function afterHandler(ctx: THttpCtx): void {
  const { requestID, payload, result, config } = ctx
  switch (config.jwt) {
    case JWT_METHOD.Sign:
    case JWT_METHOD.Refresh: {
      if (result.statusCode !== 200) {
        logger.log(`jwt ${config.jwt} fail.`, {
          requestID,
          url: payload.url,
        })
        return
      }
      const token = sign(JSON.stringify(result.jwt || {}))
      const cookie = serialize(
        globalConfig.config.http.jwt.name,
        token,
        globalConfig.config.http.jwt.cookie
      )
      setHeaders(result, {
        'Set-Cookie': cookie,
      })
      if (result.body) {
        if (typeof result.body === 'string') {
          result.body = result.body.replace(/__token__/g, token)
        }
      } else {
        result.body = JSON.stringify({
          data: token,
        })
      }
      break
    }
    default:
      break
  }
}

function verify(ctx: THttpCtx): boolean {
  try {
    const token = getToken(ctx)
    if (token) {
      const [headerStr, payloadStr, signature] = token.split('.')
      if (headerStr && payloadStr && signature) {
        const hmac = crypto.createHmac(
          'sha256',
          Buffer.from(globalConfig.config.http.jwt.key, 'base64url')
        )
        const calculated = hmac
          .update([headerStr, payloadStr].join('.'))
          .digest('base64url')
        if (calculated === signature) {
          const jwtPayload: Record<string, unknown> = JSON.parse(
            Buffer.from(payloadStr, 'base64url').toString('utf-8')
          )
          const { exp, nbf } = jwtPayload
          const now = dayjs().unix()
          if ((!exp || now <= exp) && (!nbf || now >= nbf)) {
            ctx.payload.jwt = jwtPayload
            return true
          }
        }
      }
    }
    return false
  } catch (e) {
    logger.log(`jwt verify error. ${e}`, {
      requestID: ctx.payload.requestID,
      url: ctx.payload.url,
    })
    return false
  }
}

function getToken(ctx: THttpCtx): string | null {
  const { payload } = ctx
  switch (globalConfig.config.http.jwt.location) {
    case JWT_LOCATION.Cookie: {
      const parsedCookie = parse(payload.headers['cookie'])
      return parsedCookie[globalConfig.config.http.jwt.name]
    }
    case JWT_LOCATION.Header: {
      const auth = payload.headers['authorization']
      return auth.replace(/^Bearer /, '')
    }
    case JWT_LOCATION.Param: {
      const url = new URL(payload.url, 'http://127.0.0.1/')
      return url.searchParams.get(globalConfig.config.http.jwt.name)
    }
    default:
      break
  }
  return null
}

function sign(jwtPayload: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }
  const headerStr = Buffer.from(JSON.stringify(header), 'utf-8').toString(
    'base64url'
  )
  const payloadStr = Buffer.from(jwtPayload, 'utf-8').toString('base64url')
  const hmac = crypto.createHmac(
    'sha256',
    Buffer.from(globalConfig.config.http.jwt.key, 'base64url')
  )
  const signature = hmac
    .update([headerStr, payloadStr].join('.'))
    .digest('base64url')
  return [headerStr, payloadStr, signature].join('.')
}

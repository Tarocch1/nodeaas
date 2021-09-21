import { URL } from 'url'
import { serialize, parse } from 'cookie'
import crypto from 'crypto'
import dayjs from 'dayjs'
import base64url from 'base64url'
import { config } from '@src/lib/config'
import { logger } from '@src/http'
import { THttpCtx, JWT_METHOD, JWT_LOCATION } from '@type/http.type'

export function handleJwt(ctx: THttpCtx): void {
  if (!config.config.http.jwt) return
  if (ctx.response.writableEnded) return
  if (!ctx.config.jwt) return
  if (ctx.result) {
    // 函数运行之后
    afterHandler(ctx)
  } else {
    // 函数运行之前
    beforeHandler(ctx)
  }
}

function beforeHandler(ctx: THttpCtx): void {
  const { payload, response } = ctx
  switch (ctx.config.jwt) {
    case JWT_METHOD.Verify:
    case JWT_METHOD.Refresh:
      if (!verify(ctx)) {
        logger.log(`jwt verify fail.`, {
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
  const { response, payload, result } = ctx
  switch (ctx.config.jwt) {
    case JWT_METHOD.Sign:
    case JWT_METHOD.Refresh: {
      if (ctx.result.statusCode !== 200) {
        logger.log(`jwt ${ctx.config.jwt} fail.`, {
          url: payload.url,
        })
        response.statusCode = 403
        response.end()
        return
      }
      const token = sign(ctx.result.body as string)
      const cookie = serialize(
        config.config.http.jwt.name,
        token,
        config.config.http.jwt.cookie
      )
      if (result.headers) {
        if (result.headers['Set-Cookie']) {
          if (Array.isArray(result.headers['Set-Cookie'])) {
            result.headers['Set-Cookie'].push(cookie)
          } else {
            result.headers['Set-Cookie'] = [
              result.headers['Set-Cookie'],
              cookie,
            ]
          }
        } else {
          result.headers['Set-Cookie'] = cookie
        }
      } else {
        result.headers = {
          'Set-Cookie': cookie,
        }
      }
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
          base64url.toBuffer(config.config.http.jwt.key)
        )
        const calculated = base64url.fromBase64(
          hmac.update([headerStr, payloadStr].join('.')).digest('base64')
        )
        if (calculated === signature) {
          const jwtPayload: Record<string, unknown> = JSON.parse(
            base64url.decode(payloadStr)
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
      url: ctx.payload.url,
    })
    return false
  }
}

function getToken(ctx: THttpCtx): string | null {
  const { payload } = ctx
  switch (config.config.http.jwt.location) {
    case JWT_LOCATION.Cookie: {
      const parsedCookie = parse(payload.headers['cookie'])
      return parsedCookie[config.config.http.jwt.name]
    }
    case JWT_LOCATION.Header: {
      const auth = payload.headers['authorization']
      return auth.replace(/^Bearer /, '')
    }
    case JWT_LOCATION.Param: {
      const url = new URL(payload.url, 'http://127.0.0.1/')
      return url.searchParams.get(config.config.http.jwt.name)
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
  const headerStr = base64url.encode(JSON.stringify(header))
  const payloadStr = base64url.encode(jwtPayload)
  const hmac = crypto.createHmac(
    'sha256',
    base64url.toBuffer(config.config.http.jwt.key)
  )
  const signature = base64url.fromBase64(
    hmac.update([headerStr, payloadStr].join('.')).digest('base64')
  )
  return [headerStr, payloadStr, signature].join('.')
}

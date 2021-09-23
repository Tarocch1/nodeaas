import http from 'http'
import { config } from '@src/lib/config'
import { logger } from '@src/http'
import { getPayload } from '@src/http/payload'
import { handleJwt } from '@src/http/jwt'
import { runFunction } from '@src/http/run'
import { THttpCtx } from '@type/http.type'

export function createServer(): void {
  try {
    const server = http.createServer(handler)
    server.listen(
      {
        port: config.config.http.port,
        host: config.config.http.host,
      },
      () => {
        logger.log(
          `listening on ${config.config.http.host}:${config.config.http.port}.`
        )
      }
    )
  } catch (e) {
    logger.log(`createServer error. ${e}`, {
      stack: e.stack,
    })
  }
}

async function handler(
  request: http.IncomingMessage,
  response: http.ServerResponse
) {
  logger.log('receive http request.', {
    url: request.url,
  })
  try {
    const ctx: THttpCtx = {
      request,
      response,
    }
    Promise.resolve(ctx)
      .then(getConfig)
      .then(getPayload)
      .then(handleJwt)
      .then(runFunction)
      .then(handleJwt)
      .then(sendReply)
  } catch (e) {
    logger.log(`http handler error. ${e}`, {
      url: request.url,
      stack: e.stack,
    })
    response.statusCode = 500
    response.end()
  }
}

function getConfig(ctx: THttpCtx): THttpCtx {
  if (ctx.response.writableEnded) return ctx
  const { request, response } = ctx
  const functionConfig = config.config.httpFunctions.find((f) =>
    f.path.test(request.url)
  )
  if (functionConfig) {
    ctx.config = functionConfig
  } else {
    logger.log(`unknown http function.`, {
      url: request.url,
    })
    response.statusCode = 404
    response.end()
  }
  return ctx
}

function sendReply(ctx: THttpCtx): void {
  if (ctx.response.writableEnded) return
  const { response, result, payload } = ctx
  logger.log(`send http reply.`, {
    url: payload.url,
    result,
  })
  response.statusCode = result.statusCode || 200
  result.headers &&
    Object.entries(result.headers).forEach(([key, value]) => {
      response.setHeader(key, value)
    })
  response.end(result.body)
}

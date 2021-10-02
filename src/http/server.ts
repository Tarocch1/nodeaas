import http from 'http'
import { v4 as uuidv4 } from 'uuid'
import { config } from '@src/lib/config'
import { logger } from '@src/http'
import { getPayload } from '@src/http/payload'
import { handleJwt } from '@src/http/jwt'
import { runFunction } from '@src/http/run'
import { cors } from '@src/http/cors'
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
  const requestID = uuidv4()
  logger.log('receive http request.', {
    requestID,
    url: request.url,
  })
  try {
    const ctx: THttpCtx = {
      requestID,
      request,
      response,
    }
    Promise.resolve(ctx)
      .then(getConfig)
      .then(getPayload)
      .then(cors)
      .then(handleJwt)
      .then(runFunction)
      .then(handleJwt)
      .then(cors)
      .then(sendReply)
  } catch (e) {
    logger.log(`http handler error. ${e}`, {
      requestID,
      url: request.url,
      stack: e.stack,
    })
    response.statusCode = 500
    response.end()
  }
}

function getConfig(ctx: THttpCtx): THttpCtx {
  if (ctx.response.writableEnded) return ctx
  const { requestID, request, response } = ctx
  let path = request.url
  const method = request.method
  const corsMethod = request.headers['access-control-request-method']
  if (config.config.http.prefix) {
    if (!path.startsWith(config.config.http.prefix)) {
      logger.log(`url doesn't match the prefix.`, {
        requestID,
        url: request.url,
        prefix: config.config.http.prefix,
      })
      response.statusCode = 404
      response.end()
      return ctx
    }
    path = path.slice(config.config.http.prefix.length)
  }
  const functionConfig = config.config.httpFunctions.find(
    (f) =>
      f.path.test(path) &&
      (f.method ? [method, corsMethod].includes(f.method) : true)
  )
  if (functionConfig) {
    ctx.config = functionConfig
  } else {
    logger.log(`unknown http function.`, {
      requestID,
      url: request.url,
      method,
      corsMethod,
    })
    response.statusCode = 404
    response.end()
  }
  return ctx
}

function sendReply(ctx: THttpCtx): void {
  if (ctx.response.writableEnded) return
  const { requestID, response, result, payload } = ctx
  logger.log(`send http reply.`, {
    requestID,
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

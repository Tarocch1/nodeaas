import http from 'http'
import { config } from '@src/lib/config'
import { logger } from '@src/http'
import { getPayload } from '@src/http/payload'
import { runFunction } from '@src/http/run'
import { THttpCtx } from '@type/http.type'

export function createServer(): void {
  try {
    const server = http.createServer(handler)
    server.listen(config.config.http.port, config.config.http.host)
    logger.log(
      `listening on ${config.config.http.host}:${config.config.http.port}.`
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
    getConfig(ctx)
    await getPayload(ctx)
    await runFunction(ctx)
  } catch (e) {
    logger.log(`http handler error. ${e}`, {
      url: request.url,
      stack: e.stack,
    })
    response.statusCode = 500
    response.end()
  }
}

function getConfig(ctx: THttpCtx): void {
  if (ctx.response.writableEnded) return
  const { request, response } = ctx
  const functionConfig = config.config.httpFunctions.find((f) =>
    f.path.test(request.url)
  )
  if (functionConfig) {
    ctx.config = functionConfig
  } else {
    logger.log(`unknown function.`, {
      url: request.url,
    })
    response.statusCode = 404
    response.end()
  }
}

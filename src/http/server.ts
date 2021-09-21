import http from 'http'
import { config } from '@src/lib/config'
import { run } from '@src/lib/runner'
import { logger } from '@src/http'
import { getPayload } from '@src/http/payload'
import { RUNNER_STATUS } from '@type/runner.type'
import { THttpResult } from '@type/http.type'

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
    const payload = await getPayload(request)
    logger.log('http function payload.', {
      url: request.url,
      payload,
    })
    const func = config.config.httpFunctions.find((f) =>
      f.path.test(request.url)
    )
    if (func) {
      const runnerResult = await run(
        func.name,
        func.module,
        func.timeout || 60 * 1000,
        payload
      )
      switch (runnerResult.status) {
        case RUNNER_STATUS.Success: {
          logger.log(`http function success.`, {
            url: request.url,
            config: func,
          })
          const result: THttpResult | undefined = runnerResult.result
          if (!result) {
            response.statusCode = 200
            response.end()
            return
          }
          response.statusCode = result.statusCode || 200
          result.headers &&
            Object.entries(result.headers).forEach(([key, value]) => {
              response.setHeader(key, value)
            })
          response.end(result.body)
          break
        }
        case RUNNER_STATUS.Timeout: {
          logger.log(`http function timeout.`, {
            url: request.url,
            config: func,
          })
          response.statusCode = 504
          response.end()
          break
        }
        case RUNNER_STATUS.Error: {
          const e = runnerResult.error
          logger.log(`http function error. ${e}`, {
            url: request.url,
            config: func,
          })
          response.statusCode = 500
          response.end()
          break
        }
        default:
          break
      }
    } else {
      logger.log(`unknown function.`, {
        url: request.url,
      })
      response.statusCode = 404
      response.end()
    }
  } catch (e) {
    logger.log(`http handler error. ${e}`, {
      url: request.url,
      stack: e.stack,
    })
    response.statusCode = 500
    response.end()
  }
}

import { run } from '@src/lib/runner'
import { logger } from '@src/http'
import { THttpCtx, THttpResult } from '@type/http.type'
import { RUNNER_STATUS } from '@type/runner.type'

export async function runFunction(ctx: THttpCtx): Promise<void> {
  if (ctx.response.writableEnded) return
  const { request, response, config, payload } = ctx
  const runnerResult = await run(
    config.name,
    config.module,
    config.timeout || 60 * 1000,
    payload
  )
  switch (runnerResult.status) {
    case RUNNER_STATUS.Success: {
      logger.log(`http function run success.`, {
        url: request.url,
        config,
      })
      const result: THttpResult | undefined = runnerResult.result
      if (!result) {
        // 函数未返回数据直接退出
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
      logger.log(`http function run timeout.`, {
        url: request.url,
        config,
      })
      response.statusCode = 504
      response.end()
      break
    }
    case RUNNER_STATUS.Error: {
      const e = runnerResult.error
      logger.log(`http function run error. ${e}`, {
        url: request.url,
        config,
      })
      response.statusCode = 500
      response.end()
      break
    }
    default:
      break
  }
}

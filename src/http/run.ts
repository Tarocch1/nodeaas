import { run } from '@src/lib/runner'
import { logger } from '@src/http'
import { THttpCtx, THttpResult } from '@type/http.type'
import { RUNNER_STATUS } from '@type/runner.type'

export async function runFunction(ctx: THttpCtx): Promise<THttpCtx> {
  if (ctx.response.writableEnded) return ctx
  const { request, config, payload } = ctx
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
      if (result) {
        ctx.result = result
      } else {
        // 函数未返回数据直接退出
        ctx.result = {
          statusCode: 200,
        }
      }
      break
    }
    case RUNNER_STATUS.Timeout: {
      logger.log(`http function run timeout.`, {
        url: request.url,
        config,
      })
      ctx.result = {
        statusCode: 504,
      }
      break
    }
    case RUNNER_STATUS.Error: {
      const e = runnerResult.error
      logger.log(`http function run error. ${e}`, {
        url: request.url,
        config,
      })
      ctx.result = {
        statusCode: 500,
      }
      break
    }
    default:
      break
  }
  return ctx
}

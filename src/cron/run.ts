import { run } from '@src/lib/runner'
import { logger } from '@src/cron'
import { TCronFunctionConfig, TCronPayload } from '@type/cron.type'
import { RUNNER_STATUS } from '@type/runner.type'

export async function runFunction(config: TCronFunctionConfig): Promise<void> {
  const payload: TCronPayload = {
    time: new Date(),
  }
  const runnerResult = await run(
    config.name,
    config.module,
    config.timeout || 60 * 1000,
    payload
  )

  switch (runnerResult.status) {
    case RUNNER_STATUS.Success: {
      logger.log(`cron function run success.`, {
        config,
        payload,
      })
      break
    }
    case RUNNER_STATUS.Timeout: {
      logger.log(`cron function run timeout.`, {
        config,
        payload,
      })
      break
    }
    case RUNNER_STATUS.Error: {
      const e = runnerResult.error
      logger.log(`cron function run error. ${e}`, {
        config,
        payload,
      })
      break
    }
    default:
      break
  }
}

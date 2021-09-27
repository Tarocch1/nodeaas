import { config } from '@src/lib/config'
import { cron } from '@src/cron/cron'
import { runFunction } from '@src/cron/run'
import { logger } from '@src/cron'

export function createCrond(): void {
  config.config.cronFunctions.forEach((functionConfig) => {
    cron(functionConfig.cron, async function () {
      try {
        logger.log(`cron runner start.`, {
          config: functionConfig,
        })
        await runFunction(functionConfig)
      } catch (e) {
        logger.log(`cron runner error. ${e}`, {
          stack: e.stack,
        })
      }
    })
    logger.log(`loaded cron function ${functionConfig.name}.`, {
      config: functionConfig,
    })
  })
}

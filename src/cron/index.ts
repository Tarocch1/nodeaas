import { config } from '@src/lib/config'
import { Logger } from '@src/lib/logger'
import { createCrond } from '@/src/cron/crond'

export const logger = new Logger({
  module: 'cron',
})

export function initCron(): void {
  if (config.config.cronFunctions.length > 0) {
    createCrond()
  } else {
    logger.log('no cron functions.')
  }
}

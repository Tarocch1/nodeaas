import { config } from '@src/lib/config'
import { Logger } from '@src/lib/logger'
import { createServer } from '@src/http/server'

export const logger = new Logger({
  module: 'http',
})

export function initHttp(): void {
  if (config.config.httpFunctions.length > 0) {
    createServer()
  } else {
    logger.log('no http functions.')
  }
}

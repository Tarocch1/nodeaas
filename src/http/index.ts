import { config } from '../lib/config'
import { Logger } from '../lib/logger'
import { createServer } from './server'

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

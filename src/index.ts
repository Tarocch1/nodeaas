import { command } from '@src/lib/command'
import { config } from '@src/lib/config'
import { initServices } from '@src/services'
import { initHttp } from '@src/http'
import { initCron } from '@src/cron'

async function start() {
  await config.initConfig(command.opts().config)
  initServices()
  initHttp()
  initCron()
}

start()

process.stdin.resume()

import { command } from '@src/lib/command'
import { config } from '@src/lib/config'
import { initHttp } from '@src/http'
import { initCron } from '@src/cron'

async function start() {
  await config.initConfig(command.opts().config)

  initHttp()

  initCron()
}

start()

process.stdin.resume()

import { command } from '@src/lib/command'
import { config } from '@src/lib/config'
import { initHttp } from '@src/http'

async function start() {
  await config.initConfig(command.opts().config)

  initHttp()
}

start()

process.stdin.resume()

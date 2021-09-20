import { command } from './lib/command'
import { config } from './lib/config'
import { initHttp } from './http'

async function start() {
  await config.initConfig(command.opts().config)

  initHttp()
}

start()

process.stdin.resume()

import { command } from './lib/command'
import { config } from './lib/config'

async function start() {
  await config.initConfig(command.opts().config)
}

start()

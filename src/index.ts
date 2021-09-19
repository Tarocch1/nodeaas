import { command } from './lib/command';
import { config } from './lib/config';

function start() {
  config.initConfig(command.opts().config);
}

start();

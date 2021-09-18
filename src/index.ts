import { getCommand } from './lib/command';
import { Logger } from './lib/logger';

function start() {
  const command = getCommand()
  const logger = new Logger({
    module: 'main',
  });
}

start();

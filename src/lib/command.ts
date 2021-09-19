import { Command } from 'commander';
const { version } = require('../../package.json');

function initCommand() {
  const command = new Command();
  command.version(version, '-v, --version');

  command.option(
    '-c, --config [path]',
    'config file path',
    './nodeaas.config.js'
  );
  command.parse();

  return command;
}

export const command = initCommand();

import { Command } from 'commander';
const { version } = require('../../package.json');

export function getCommand() {
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

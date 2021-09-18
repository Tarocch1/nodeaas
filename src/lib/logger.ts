import dayjs from 'dayjs';
import { merge } from 'lodash-es';

export const defaultOption = {
  module: '',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
};

export type LoggerOption = typeof defaultOption;

export class Logger {
  constructor(option: Partial<LoggerOption> = defaultOption) {
    this.option = merge(defaultOption, option);
  }

  private option: LoggerOption;

  log(message: string) {
    const { dateFormat, module } = this.option;
    console.log(`[${dayjs().format(dateFormat)}] [${module}] ${message}`);
  }
}

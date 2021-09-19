import dayjs from 'dayjs'
import { merge } from 'lodash-es'

export const defaultOption = {
  module: '',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
}

export type TLoggerOption = typeof defaultOption

export class Logger {
  constructor(option: AtLeast<TLoggerOption, 'module'> = defaultOption) {
    this.option = merge(defaultOption, option)
  }

  private option: TLoggerOption

  log(message: string): void {
    const { dateFormat, module } = this.option
    const messages = message.split('\n')
    messages.forEach((msg) => {
      console.log(`[${dayjs().format(dateFormat)}] [${module}] ${msg}`)
    })
  }
}

export const logger = new Logger({
  module: 'main',
})

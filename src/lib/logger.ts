import { inspect } from 'util'
import dayjs from 'dayjs'
import { merge, cloneDeep } from 'lodash-es'

export const defaultOption = {
  module: '',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
}

export type TLoggerOption = typeof defaultOption

export class Logger {
  constructor(option: AtLeast<TLoggerOption, 'module'> = defaultOption) {
    this.option = merge(cloneDeep(defaultOption), option)
  }

  private option: TLoggerOption

  log(message: string, data?: Record<string, unknown>): void {
    const { dateFormat, module } = this.option
    const extra = data
      ? ` - METADATA: ${inspect(data, {
          depth: Infinity,
          colors: true,
          maxArrayLength: Infinity,
          maxStringLength: Infinity,
          breakLength: Infinity,
          compact: Infinity,
        })}`
      : ''
    const messages = `${message}${extra}`.split('\n')
    messages.forEach((msg) => {
      console.log(`[${dayjs().format(dateFormat)}] [${module}] ${msg}`)
    })
  }
}

export const logger = new Logger({
  module: 'main',
})

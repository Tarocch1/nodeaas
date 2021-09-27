import { parseExpression } from 'cron-parser'

const TIMEOUT_MAX = 2147483647

export function cron(cronStr: string, fn: () => void): void {
  const interval = parseExpression(cronStr)
  const _fn = function (run = true): void {
    if (run) fn()
    if (interval.hasNext()) {
      const after = interval.next().toDate().valueOf() - Date.now()
      const timeout = new Timeout(_fn, after)
      timeout.start()
    }
  }
  _fn(false)
}

class Timeout {
  constructor(fn: () => void, after: number) {
    this.after = after
    this.fn = fn
  }

  private timer: NodeJS.Timeout

  private after = 0

  private fn: () => void

  start() {
    if (this.after <= TIMEOUT_MAX) {
      this.timer = setTimeout(() => {
        this.close()
        this.fn()
      }, this.after)
    } else {
      this.timer = setTimeout(() => {
        this.after -= TIMEOUT_MAX
        this.close()
        this.start()
      }, TIMEOUT_MAX)
    }
  }

  close() {
    clearTimeout(this.timer)
  }
}

import { ChildProcess, Serializable } from 'child_process'
import { eventEmitter } from '@src/lib/eventEmitter'
import { Logger } from '@src/lib/logger'

export class Service {
  constructor(eventName: string) {
    this.logger = new Logger({
      module: eventName,
    })
    this.eventName = eventName
    eventEmitter.on(eventName, this.handler.bind(this))
    this.init()
  }

  logger: Logger

  eventName: string

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  handler(subprocess: ChildProcess, data: Serializable, id?: string): void {}
}

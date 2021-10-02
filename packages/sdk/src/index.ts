import { eventEmitter } from './eventEmitter'
import { RUNNER_IPC_TYPE, TRunnerIpcMessage } from './type'
// export * from './services'

export function handle(handler: (payload: unknown) => unknown): void {
  process.on('message', (message: TRunnerIpcMessage) => {
    if (message.type === RUNNER_IPC_TYPE.START) {
      const payload = message.data
      const result = handler(payload)
      const p = result instanceof Promise ? result : Promise.resolve(result)
      p.then((r) => {
        process.send({
          type: RUNNER_IPC_TYPE.END,
          data: r,
        } as TRunnerIpcMessage)
        process.disconnect()
      })
    } else if (message.type === RUNNER_IPC_TYPE.SERVICE) {
      eventEmitter.emit(message.id, message.data)
    }
  })
}

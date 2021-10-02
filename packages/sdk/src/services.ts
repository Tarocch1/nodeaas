import { v4 as uuidv4 } from 'uuid'
import { Serializable } from 'child_process'
import { RUNNER_IPC_TYPE, TRunnerIpcMessage } from './type'
import { eventEmitter } from './eventEmitter'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Service {
  constructor(name: string) {
    this.name = name
  }

  private name: string

  call(data: Serializable): Promise<Serializable> {
    return new Promise((resolve) => {
      const id = uuidv4()
      process.send({
        type: RUNNER_IPC_TYPE.SERVICE,
        id,
        name: this.name,
        data,
      } as TRunnerIpcMessage)
      eventEmitter.once(id, (data: Serializable) => {
        resolve(data)
      })
    })
  }
}

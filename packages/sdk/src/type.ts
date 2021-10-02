import { Serializable } from 'child_process'

export enum RUNNER_IPC_TYPE {
  START = 'start',
  END = 'end',
  SERVICE = 'service',
}

export type TRunnerIpcMessage = {
  type: RUNNER_IPC_TYPE
  id?: string
  name?: string
  data: Serializable
}

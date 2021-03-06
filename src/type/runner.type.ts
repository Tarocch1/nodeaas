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

export enum RUNNER_STATUS {
  Success = 1,
  Error,
  Timeout,
}

export type TRunnerResult = {
  status: RUNNER_STATUS
  result?: unknown
  error?: Error
}

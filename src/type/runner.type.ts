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

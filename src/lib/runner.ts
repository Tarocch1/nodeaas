import { fork, Serializable } from 'child_process'

export enum RUNNER_STATUS {
  Success = 1,
  Error,
  Timeout,
}

export type TRUNNER_RESULT = {
  status: RUNNER_STATUS
  result?: unknown
  error?: Error
}

export function run(
  module: string,
  payload: Serializable,
  timeout: number
): Promise<TRUNNER_RESULT> {
  return new Promise((resolve) => {
    let handled = false
    const subprocess = fork(module, {
      serialization: 'advanced',
    })

    const timer = setTimeout(() => {
      if (handled) return
      handled = true
      clearTimeout(timer)
      subprocess.removeAllListeners()
      subprocess.kill()
      resolve({
        status: RUNNER_STATUS.Timeout,
      })
    }, timeout)

    subprocess.once('spawn', () => {
      subprocess.send(payload)
    })

    subprocess.once('message', (message) => {
      if (handled) return
      handled = true
      clearTimeout(timer)
      subprocess.removeAllListeners()
      subprocess.kill()
      resolve({
        status: RUNNER_STATUS.Success,
        result: message,
      })
    })

    subprocess.once('exit', (code) => {
      if (handled) return
      handled = true
      clearTimeout(timer)
      subprocess.removeAllListeners()
      if (code !== null && code != 0) {
        resolve({
          status: RUNNER_STATUS.Error,
          error: new Error(`Child process exited with code ${code}.`),
        })
      } else if (code === 0) {
        resolve({
          status: RUNNER_STATUS.Success,
        })
      } else {
        resolve({
          status: RUNNER_STATUS.Error,
          error: new Error('Child process terminated.'),
        })
      }
    })

    subprocess.once('error', (e) => {
      if (handled) return
      handled = true
      clearTimeout(timer)
      subprocess.removeAllListeners()
      subprocess.kill()
      resolve({
        status: RUNNER_STATUS.Error,
        error: e,
      })
    })
  })
}

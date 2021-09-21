import { fork, Serializable } from 'child_process'
import { Logger } from '@src/lib/logger'
import { TRunnerResult, RUNNER_STATUS } from '@type/runner.type'

export function run(
  name: string,
  module: string,
  timeout: number,
  payload: Serializable
): Promise<TRunnerResult> {
  const logger = new Logger({
    module: name,
  })

  return new Promise((resolve) => {
    let handled = false
    const subprocess = fork(module, {
      serialization: 'advanced',
      silent: true,
    })

    subprocess.stdout.on('data', (chunk: Buffer) => {
      logger.log(chunk.toString().replace(/\n$/, ''))
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
        // 函数非 0 退出
        resolve({
          status: RUNNER_STATUS.Error,
          error: new Error(`Child process exited with code ${code}.`),
        })
      } else if (code === 0) {
        // 函数未返回数据直接退出
        resolve({
          status: RUNNER_STATUS.Success,
        })
      } else {
        // 函数进程被杀
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

import { fork, Serializable } from 'child_process'
import { Logger } from '@src/lib/logger'
import { eventEmitter } from '@src/lib/eventEmitter'
import {
  RUNNER_IPC_TYPE,
  TRunnerIpcMessage,
  TRunnerResult,
  RUNNER_STATUS,
} from '@type/runner.type'

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
      subprocess.send({
        type: RUNNER_IPC_TYPE.START,
        data: payload,
      } as TRunnerIpcMessage)
    })

    subprocess.on('message', (message: TRunnerIpcMessage) => {
      if (handled) return
      if (message.type === RUNNER_IPC_TYPE.END) {
        handled = true
        clearTimeout(timer)
        subprocess.removeAllListeners()
        subprocess.kill()
        resolve({
          status: RUNNER_STATUS.Success,
          result: message.data,
        })
      } else if (message.type === RUNNER_IPC_TYPE.SERVICE) {
        if (message.name) {
          eventEmitter.emit(message.name, subprocess, message.data, message.id)
        }
      }
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
          error: new Error('Child process killed.'),
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

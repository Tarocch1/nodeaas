import path from 'path'
import { merge } from 'lodash-es'
import { logger } from '@src/lib/logger'
import { TConfig } from '@type/config.type'

export const defaultConfig: TConfig = {
  http: {
    port: 80,
    host: '0.0.0.0',
    prefix: '',
  },
  httpFunctions: [],
  cronFunctions: [],
}

export class Config {
  config: TConfig

  async initConfig(configPath: string): Promise<void> {
    try {
      const fullPath = path.isAbsolute(configPath)
        ? configPath
        : path.join(process.cwd(), configPath)

      const config = await import(fullPath)
      this.config = merge(defaultConfig, config.default)
      logger.log(`initConfig success.`, {
        config: this.config,
      })
    } catch (e) {
      logger.log(`initConfig error. ${e}`, {
        stack: e.stack,
      })
      process.exit(1)
    }
  }
}

export const config = new Config()

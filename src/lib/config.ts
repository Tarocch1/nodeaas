import path from 'path';
import { merge } from 'lodash-es';
import { logger } from './logger';

export type THttpFunctionConfig = {
  module: string;
  timeout?: number;
};

export type TConfig = {
  http: {
    port: number;
    host: string;
    prefix: string;
  };
  httpFunctions: THttpFunctionConfig[];
};

export const defaultConfig: TConfig = {
  http: {
    port: 80,
    host: '0.0.0.0',
    prefix: '',
  },
  httpFunctions: [],
};

export class Config {
  config: TConfig;

  initConfig(configPath: string) {
    try {
      const fullPath = path.isAbsolute(configPath)
        ? configPath
        : path.join(process.cwd(), configPath);
      const config = require(fullPath);
      this.config = merge(defaultConfig, config);
    } catch (err) {
      logger.log(`initConfig fail. ${err.message}`);
      process.exit(1);
    }
  }
}

export const config = new Config();

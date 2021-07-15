import * as childProcess from 'child_process';
import { logger as defaultLogger } from './logger';

const logger = defaultLogger.child({ name: 'execute' });

export function executeShellCommand(cmd: string) {
  logger.info(cmd);
  return new Promise<number>((resolve, reject) => {
    const child = childProcess.exec(cmd, (error) => {
      if (error) return resolve(error.code ?? 1);
      resolve(0);
    });

    child.once('error', (error) => {
      reject(error);
    });
  });
}

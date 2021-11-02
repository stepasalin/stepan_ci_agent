import * as childProcess from 'child_process';
import { stringDiff } from './stringDiff';
import { fileExists, readFile } from './fsStuff';
import { logger as defaultLogger } from './logger';
const fs = require('fs').promises;

const logger = defaultLogger.child({ name: 'execute' });

export function executeShellCommand(cmd: String, logPath: String) {
  const cmdWithLogPath = `${cmd} >> ${logPath} 2>&1`;
  logger.info(`Executing ${cmdWithLogPath}`);
  return new Promise<number>((resolve, reject) => {
    const child = childProcess.exec(cmdWithLogPath, (error) => {
      if (error) return resolve(error.code ?? 1);
      resolve(0);
    });

    child.once('error', (error) => {
      reject(error);
    });
  });
}

export async function newLog(logPath: string): Promise<string> {
  const currentLog = await readFile(logPath);
  const previousLogPath = `${logPath}.previous`;

  if (!(await fileExists(previousLogPath))) {
    await fs.writeFile(previousLogPath, currentLog);
    return currentLog;
  }

  const previousLog = await readFile(previousLogPath);
  await fs.writeFile(previousLogPath, currentLog);
  return stringDiff(previousLog, currentLog);
}

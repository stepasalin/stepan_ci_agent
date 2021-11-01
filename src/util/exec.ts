import * as childProcess from 'child_process';
import { resolve } from 'path';
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

function previouslySentLogPath(logPath: string) {
  return `${logPath}.previous`;
}

async function fileExists(path: string): Promise<boolean> {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

async function readFile(path: string): Promise<string> {
  return (await fs.readFile(path)).toString();
}

function stringDiff(str1: String, str2: String) {
  let diff = '';
  str2.split('').forEach(function (val, i) {
    if (val != str1.charAt(i)) diff += val;
  });
  return diff;
}

export async function newLog(logPath: string): Promise<string> {
  logger.debug('entered calculate new log method');
  const currentLog = await readFile(logPath);
  const previousLogPath = previouslySentLogPath(logPath);

  if (!(await fileExists(previousLogPath))) {
    logger.debug(
      `.previous file NOT FOUND, therefore writing to ${previousLogPath}`
    );
    await fs.writeFile(previousLogPath, currentLog);
    return currentLog;
  }

  logger.debug(`.previous file FOUND, calculating log digg`);
  const previousLog = await readFile(previousLogPath);
  await fs.writeFile(previousLogPath, currentLog);
  return stringDiff(previousLog, currentLog);
}

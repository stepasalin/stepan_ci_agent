import * as childProcess from 'child_process';
import { logger as defaultLogger } from './logger';
import * as fs from 'fs';
const path = require('path');

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

function stringDiff(str1: string, str2: string) {
  let diff = '';
  str2.split('').forEach(function (val, i) {
    if (val != str1.charAt(i)) diff += val;
  });
  return diff;
}

async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

export async function newLog(logPath: string) {
  const currentLog = await readFile(logPath);
  const previousLogPath = previouslySentLogPath(logPath);

  if (!path.existsSync(previousLogPath)) {
    return currentLog;
  }

  const previousLog = await readFile(previousLogPath);
  return stringDiff(previousLog, currentLog);
}

import * as childProcess from 'child_process';

export function executeShellCommand(cmd: string) {
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

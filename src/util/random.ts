import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { AGENT_NAME, LOG_DIR } from '../config';

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateString(length: number) {
  let result = '';

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function acquireLogPath(): Promise<string> {
  await ensureDir(LOG_DIR);
  return join(LOG_DIR, AGENT_NAME, `${generateString(8)}.log`);
}

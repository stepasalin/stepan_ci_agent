const fs = require('fs').promises;

export async function fileExists(path: string): Promise<boolean> {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

export async function readFile(path: string): Promise<string> {
  return (await fs.readFile(path)).toString();
}

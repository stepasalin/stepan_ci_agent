// import { createReadStream, readFile } from 'fs-extra';
import { AgentInfoManager } from './util/AgentInfoManager';
// import { AGENT_NAME } from './config';
// import { executeShellCommand } from './util/exec';
// import { logger } from './util/logger';

// async function sendLog(): Promise<void> {}

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  console.log('++++');
  console.log(await infoManager.getInfo());
  console.log('++++');
  process.exit();
}

agent();

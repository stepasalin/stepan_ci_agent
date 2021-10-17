// import { createReadStream, readFile } from 'fs-extra';
import { AGENT_NAME } from './config';
import { makeServerRequest } from './util/serverRequest';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
// import { AGENT_NAME } from './config';
// import { executeShellCommand } from './util/exec';
// import { logger } from './util/logger';

// async function sendLog(): Promise<void> {}

async function registerAtServer(): Promise<String> {
  const options = {
    path: 'add-agent',
    method: 'POST',
  };

  return new Promise<String>(async (resolve, _reject) => {
    const postData = { name: AGENT_NAME };
    const serverResponse = await makeServerRequest(options, postData);
    resolve(serverResponse.agent._id);
  });
}

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const infoAtStartup = await infoManager.getInfo();
  logger.info(`agent ${AGENT_NAME} has started with info ${infoAtStartup}`);
  if (infoAtStartup == null) {
    const thisAgentId = await registerAtServer();
    const newAgentInfo = {
      ...AgentInfoManager.DEFAULT_INFO,
      ...{ id: thisAgentId },
    };
    infoManager.updateInfo(newAgentInfo);
  }
  process.exit();
}

agent();

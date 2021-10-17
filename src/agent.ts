import { AGENT_NAME, SERVER_HOST, SERVER_PORT } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { postToServer } from './util/serverRequest';
const request = require('request');

async function getNewAgentId() {
  const responseBody: any = await postToServer('add-agent', {
    name: AGENT_NAME,
  });
  return responseBody.agent._id;
}

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const infoAtStartup = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} has started with info ${JSON.stringify(infoAtStartup)}`
  );
  if (infoAtStartup == null) {
    const thisAgentId = await getNewAgentId();
    const newAgentInfo = {
      ...AgentInfoManager.DEFAULT_INFO,
      ...{ id: thisAgentId },
    };
    infoManager.updateInfo(newAgentInfo);
  }
  process.exit();
}

agent();

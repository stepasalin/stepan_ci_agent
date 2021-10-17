import { AGENT_NAME, SERVER_HOST, SERVER_PORT } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
const request = require('request');

function getNewAgentId(): Promise<String> {
  return new Promise<String>((resolve, _reject) => {
    request.post(
      {
        url: `http://${SERVER_HOST}:${SERVER_PORT}/add-agent`,
        json: { name: AGENT_NAME },
      },
      function (err: any, httpResponse: any, body: any) {
        logger.info('Sending request to server');
        logger.info(`Err ${err}`);
        logger.info(`Http Response ${JSON.stringify(httpResponse)}`);
        logger.info(`Body ${JSON.stringify(body)}`);
        resolve(body.agent._id);
      }
    );
  });
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

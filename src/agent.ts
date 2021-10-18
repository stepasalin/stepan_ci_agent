import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { postToServer, getFromServer } from './util/serverRequest';
import { isEmpty } from './util/isEmpty';

async function getNewAgentId() {
  const responseBody: any = await postToServer('add-agent', {
    name: AGENT_NAME,
  });
  return responseBody.agent._id;
}

async function getRun(agentId: String) {
  const responseBody: any = await postToServer('get-run', { agentId: agentId });
  return responseBody;
}

async function getRunCmd(agentId: String, runId: String) {
  const responseBody: any = await getFromServer('run-command', {
    agentId: agentId,
    runId: runId,
  });

  return JSON.parse(responseBody).runCmd;
}

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const infoAtStartup: any = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} has started with info ${JSON.stringify(infoAtStartup)}`
  );
  if (infoAtStartup == null) {
    logger.info(
      `Agent ${AGENT_NAME} started with empty info, will register at server`
    );
    const thisAgentId = await getNewAgentId();
    const newAgentInfo = {
      ...AgentInfoManager.DEFAULT_INFO,
      ...{ id: thisAgentId },
    };
    infoManager.updateInfo(newAgentInfo);
  }

  const thisAgentId = infoAtStartup.id;
  if (!infoAtStartup.busy) {
    logger.info(
      `Agent ${AGENT_NAME} awakened as free, therefore requesting a Run`
    );

    const availableRunParams = await getRun(thisAgentId);
    logger.info(`Got Run Params: ${JSON.stringify(availableRunParams)}`);

    if (isEmpty(availableRunParams)) {
      logger.info('No available runs');
      process.exit(0);
    }

    const runId = availableRunParams.runId;
    const runCmd = await getRunCmd(thisAgentId, runId);
    logger.info(`Will be running ${runCmd}, TO BE DEVELOPED`);
  }
  process.exit();
}

agent();

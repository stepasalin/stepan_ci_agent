import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { getRun, getRunCmd, updateRunStatus } from './util/serverRequest';
import { isEmpty } from './util/isEmpty';
import { executeShellCommand } from './util/exec';
import { busyAgent } from './busyAgent';
import { registerAgent } from './registerAgent';

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const agentInfo: any = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} has awakened with info ${JSON.stringify(agentInfo)}`
  );
  if (agentInfo == null) {
    await registerAgent(infoManager);
  }

  const thisAgentId = agentInfo.id;
  if (agentInfo.busy) {
    await busyAgent(infoManager, agentInfo);
  }

  if (!agentInfo.busy) {
    logger.info(
      `Agent ${AGENT_NAME} awakened as free, therefore requesting a Run`
    );

    const availableRunParams = await getRun(thisAgentId);
    logger.info(`Got Run Params: ${JSON.stringify(availableRunParams)}`);

    if (isEmpty(availableRunParams)) {
      logger.info('No available runs. Bye-bye for now');
      process.exit(0);
    }

    const runId = availableRunParams.runId;
    const runCmd = await getRunCmd(thisAgentId, runId);
    const logPath: String = await infoManager.allocateLogPath();
    agentInfo.busy = true;
    agentInfo.currentCommand = runCmd;
    agentInfo.logPath = logPath;
    await infoManager.updateInfo(agentInfo);
    await updateRunStatus(thisAgentId, runId, 'inProgress');

    const execResult = await executeShellCommand(runCmd, logPath);
    agentInfo.busy = false;
    agentInfo.currentCommand = runCmd;
    agentInfo.logPath = logPath;
    await infoManager.updateInfo(agentInfo);
    let finalStatus;
    if (execResult == 0) {
      finalStatus = 'success';
    } else {
      finalStatus = 'fail';
    }
    await updateRunStatus(thisAgentId, runId, finalStatus);

    process.exit(execResult);
  }
  process.exit();
}

agent();

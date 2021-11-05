import { AGENT_NAME } from './config';
import { logger } from './util/logger';
import { AgentInfoManager, AgentInfo } from './util/AgentInfoManager';
import { getRun, getRunCmd, updateRunStatus } from './util/serverRequest';
import { isEmpty } from './util/isEmpty';
import { executeShellCommand } from './util/exec';
import { sendLatestLogToServer } from './busyAgent';

export async function freeAgent(
  infoManager: AgentInfoManager,
  agentInfo: AgentInfo
): Promise<void> {
  logger.info(
    `Agent ${AGENT_NAME} awakened as free, therefore should request a Run`
  );

  logger.info(
    `But first will send logs of latest Run just to make sure everything is up-to-date on server`
  );
  await sendLatestLogToServer(infoManager, agentInfo);

  const thisAgentId = agentInfo.id;
  const availableRunParams = await getRun(thisAgentId);
  logger.info(`Got Run Params: ${JSON.stringify(availableRunParams)}`);

  if (isEmpty(availableRunParams)) {
    logger.info('No available runs. Bye-bye for now');
    process.exit(0);
  }

  const runId = availableRunParams.runId;
  const runCmd = await getRunCmd(thisAgentId, runId);
  const logPath: string = await infoManager.allocateLogPath();
  agentInfo.busy = true;
  agentInfo.currentCommand = runCmd;
  agentInfo.logPath = logPath;
  agentInfo.runId = runId;
  agentInfo.logCharsSent = 0;
  await infoManager.updateInfo(agentInfo);
  await updateRunStatus(thisAgentId, runId, 'inProgress');

  const execResult = await executeShellCommand(runCmd, logPath);
  agentInfo.busy = false;
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

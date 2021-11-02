import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import {
  getNewAgentId,
  getRun,
  getRunCmd,
  updateRunStatus,
} from './util/serverRequest';
import { isEmpty } from './util/isEmpty';
import { executeShellCommand, newLog } from './util/exec';

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const agentInfo: any = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} has awakened with info ${JSON.stringify(agentInfo)}`
  );
  if (agentInfo == null) {
    logger.info(`Agent ${AGENT_NAME} has empty info, will register at server`);
    const thisAgentId: String = await getNewAgentId();
    const newAgentInfo = {
      ...AgentInfoManager.DEFAULT_INFO,
      ...{ id: thisAgentId },
    };
    await infoManager.updateInfo(newAgentInfo);
    process.exit();
  }

  const thisAgentId = agentInfo.id;
  if (agentInfo.busy) {
    const { logPath } = agentInfo;
    const newLogEntry = await newLog(logPath);
    console.log(`lets do something ${newLogEntry} !`);
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

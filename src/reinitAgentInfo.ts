import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';

export async function reinitAgentInfo(
  infoManager: AgentInfoManager
): Promise<void> {
  const agentInfo = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} will be re-inited but current info is ${JSON.stringify(
      agentInfo
    )}`
  );
  agentInfo.busy = false;
  agentInfo.currentCommand = '';
  agentInfo.logPath = '';
  agentInfo.runId = '';
  agentInfo.logCharsSent = 0;
  await infoManager.updateInfo(agentInfo);
}

export async function reinitAgent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  await reinitAgentInfo(infoManager);
  process.exit(0);
}

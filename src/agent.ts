import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { busyAgent } from './busyAgent';
import { registerAgent } from './registerAgent';
import { freeAgent } from './freeAgent';

async function agent(): Promise<void> {
  const infoManager = await AgentInfoManager.create();
  const agentInfo: any = await infoManager.getInfo();
  logger.info(
    `agent ${AGENT_NAME} has awakened with info ${JSON.stringify(agentInfo)}`
  );
  if (agentInfo == null) {
    await registerAgent(infoManager);
  }

  if (agentInfo.busy) {
    await busyAgent(infoManager, agentInfo);
  }

  if (!agentInfo.busy) {
    await freeAgent(infoManager, agentInfo);
  }
  process.exit();
}

agent();

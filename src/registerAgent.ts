import { AGENT_NAME } from './config';
import { AgentInfoManager } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { getNewAgentId } from './util/serverRequest';

export async function registerAgent(
  infoManager: AgentInfoManager
): Promise<void> {
  logger.info(`Agent ${AGENT_NAME} has empty info, will register at server`);
  const thisAgentId: String = await getNewAgentId();
  const newAgentInfo = {
    ...AgentInfoManager.DEFAULT_INFO,
    ...{ id: thisAgentId },
  };
  await infoManager.updateInfo(newAgentInfo);
  process.exit();
}

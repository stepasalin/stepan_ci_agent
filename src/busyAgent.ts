import { isEmpty } from 'lodash';
import { exit } from 'process';
import { AgentInfoManager, AgentInfo } from './util/AgentInfoManager';
import { logger } from './util/logger';
import { newLog } from './util/NewLog';
import { appendRunLog } from './util/serverRequest';

export async function sendLatestLogToServer(
  infoManager: AgentInfoManager
): Promise<void> {
  const agentInfo: AgentInfo = infoManager.latestInfo;
  const newLogChunk = await newLog(infoManager);
  if (isEmpty(newLogChunk)) {
    logger.info(
      `${agentInfo.logPath} does not have any new entries, will send nothing`
    );
  } else {
    logger.info(`New log chunk: ${newLogChunk}`);
    await appendRunLog(agentInfo.id, agentInfo.runId, newLogChunk);
  }
}

export async function busyAgent(infoManager: AgentInfoManager): Promise<void> {
  await sendLatestLogToServer(infoManager);
  exit(0);
}

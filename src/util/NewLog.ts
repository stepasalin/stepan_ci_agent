import { isEmpty } from 'lodash';
import { AgentInfoManager } from './AgentInfoManager';
import { readFile } from './fsStuff';

export async function newLog(infoManager: AgentInfoManager): Promise<string> {
  const agentInfo = await infoManager.getInfo();
  const { logCharsSent, logPath } = agentInfo;
  if (isEmpty(logPath)) {
    return '';
  }
  const currentLog = await readFile(logPath);

  agentInfo.logCharsSent = currentLog.length;
  await infoManager.updateInfo(agentInfo);
  return currentLog.slice(logCharsSent);
}

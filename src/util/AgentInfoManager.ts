import * as redis from 'redis';
import { mustExist } from './assertions';
import { logger } from './logger';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { AGENT_NAME, LOG_DIR } from '../config';
import { generateString } from './random';

export class AgentInfoManager {
  static DEFAULT_INFO: AgentInfo = Object.freeze({
    busy: false,
    currentCommand: '',
    logPath: '',
  });

  private logger = logger.child({ name: 'AgentInfoManager' });

  private redisClient: redis.RedisClient = redis.createClient();

  private constructor() {}

  static async create() {
    const manager = new AgentInfoManager();
    await manager.updateInfo(AgentInfoManager.DEFAULT_INFO);
    return manager;
  }

  async getInfo(): Promise<AgentInfo> {
    const { redisClient, logger } = this;

    return new Promise((resolve, reject) =>
      redisClient.get(AGENT_NAME, (error, result) => {
        if (error) return reject(error);

        logger.debug('Fetching agent info', { agentName: AGENT_NAME });

        try {
          // TODO: vkruti tut json schemu, ne pozor'sya
          const { currentCommand, busy, logPath } = JSON.parse(
            mustExist(result)
          );
          resolve({ currentCommand, busy, logPath });
        } catch (e) {
          reject(e);
        }
      })
    );
  }

  async updateInfo(agentInfo: AgentInfo): Promise<void> {
    const { redisClient, logger } = this;

    logger.info('Writing agent info to redis', {
      agentName: AGENT_NAME,
      agentInfo,
    });

    return new Promise((resolve, reject) =>
      redisClient.set(AGENT_NAME, JSON.stringify(agentInfo), (error) => {
        if (error) return reject(error);
        resolve();
      })
    );
  }

  async allocateLogPath(): Promise<string> {
    await ensureDir(join(LOG_DIR, AGENT_NAME));
    return join(LOG_DIR, AGENT_NAME, `${generateString(8)}.log`);
  }
}

interface AgentInfo {
  /** If true, agent is currently executing a currentCommand. */
  busy: boolean;
  /** Current command being executed. */
  currentCommand: string;
  /** Absolute path to logs, local to agent machine. */
  logPath: string;
}
import * as redis from 'redis';
import { logger } from './logger';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { AGENT_NAME, LOG_DIR } from '../config';
import { generateString } from './random';
import { validate } from 'jsonschema';

export class AgentInfoManager {
  public latestInfo: any;
  static DEFAULT_INFO: AgentInfo = Object.freeze({
    busy: false,
    currentCommand: '',
    logPath: '',
    id: '',
    logCharsSent: 0,
    runId: '',
  });

  static AGENT_INFO_SCHEMA = {
    id: '/AgentInfo',
    type: 'object',
    properties: {
      busy: { type: 'boolean' },
      currentCommand: { type: 'string' },
      logPath: { type: 'string' },
    },
  };

  private logger = logger.child({ name: 'AgentInfoManager' });

  private redisClient: redis.RedisClient = redis.createClient();

  private constructor() {
    this.latestInfo = undefined;
  }

  static async create() {
    return new AgentInfoManager();
  }

  async getInfo() {
    const { redisClient, logger } = this;

    return new Promise<any>((resolve, reject) =>
      redisClient.get(AGENT_NAME, (error, result) => {
        if (error) return reject(error);

        logger.debug('Fetching agent info', { agentName: AGENT_NAME });
        if (result == null) {
          return resolve(null);
        }

        const parsedResult = JSON.parse(result);

        const validationErrors = validate(
          parsedResult,
          AgentInfoManager.AGENT_INFO_SCHEMA
        ).errors;

        if (validationErrors.length > 0) {
          logger.debug(
            `Agent Info from redis did not pass JSON schema because ${validationErrors}`
          );
          return reject(validationErrors);
        }
        this.latestInfo = parsedResult;
        return resolve(parsedResult);
      })
    );
  }

  async updateInfo(agentInfo: AgentInfo): Promise<void> {
    const { redisClient, logger } = this;

    logger.info(
      `Writing agent ${AGENT_NAME} info to redis: ${JSON.stringify(agentInfo)}`
    );

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

export interface AgentInfo {
  /** If true, agent is currently executing a currentCommand. */
  busy: boolean;
  /** Current command being executed. */
  currentCommand: string;
  /** Absolute path to logs, local to agent machine. */
  logPath: string;
  /** Agent id obtained from server. */
  id: string;
  /** How many log chars have been sent on current Run */
  logCharsSent: number;
  /** current Run Id */
  runId: string;
}

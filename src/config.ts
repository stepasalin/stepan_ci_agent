import { mustExist } from './util/assertions';

export const PORT = mustExist(process.env.PORT, "Hey where's my PORT variable");
export const AGENT_NAME = mustExist(
  process.env.AGENT_NAME,
  'AGENT_NAME is not defined'
);
export const ENV = mustExist(process.env.NODE_ENV, 'NODE_ENV is not defined');
export const LOG_DIR = '/tmp/stepan/log';

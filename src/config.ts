import { join } from 'path';
import { mustExist } from './util/assertions';

export const AGENT_NAME = mustExist(
  process.env.AGENT_NAME,
  'AGENT_NAME is not defined'
);
export const ENV = mustExist(process.env.NODE_ENV, 'NODE_ENV is not defined');
export const LOG_DIR = '/tmp/stepan/log';
export const TEMPLATE_PATH = join(__dirname, 'client/index.html');

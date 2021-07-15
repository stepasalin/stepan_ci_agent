import { invariant } from './util/invariant';

import { mustExist } from './util/invariant';

export const PORT = mustExist(process.env.PORT);
export const AGENT_NAME = mustExist(process.env.AGENT_NAME);
export const ENV = mustExist(process.env.NODE_ENV);
export const LOG_DIR = '/tmp/stepan/log';

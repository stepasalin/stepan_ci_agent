import { ENV } from '../config';

import pino from 'pino';

const isDevelopment = ENV === 'development';

export const logger = pino({
  prettyPrint: isDevelopment,
  level: isDevelopment ? 'trace' : 'info',
});

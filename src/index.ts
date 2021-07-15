import { createServer } from './app';
import { AGENT_NAME, PORT } from './config';
import { logger } from './util/logger';

(async function startup() {
  const server = await createServer();

  logger.info(`Starting agent ${AGENT_NAME}`);

  try {
    server.listen(PORT, () => {
      logger.info(`Server is listening on ${PORT}`);
    });
  } catch (e) {
    logger.fatal('Server failed to start', e);
    process.exit(1);
  }

  // Скрипт упал с непойманной ошибкой в синхронном коде
  process.once('uncaughtException', (e) => {
    logger.fatal('Uncaught Exception, byeee', e);
    process.exit(1);
  });

  // Скрипт упал с непойманным промисом
  process.once('unhandledRejection', (e) => {
    logger.fatal('Unhandled Rejection, byeee', e);
    process.exit(1);
  });
})();

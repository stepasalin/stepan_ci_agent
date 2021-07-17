import { createReadStream, readFile } from 'fs-extra';
import { template } from 'lodash';
import express from 'express';
import expressLoggerMiddleware from 'express-pino-logger';
import { AgentInfoManager } from './util/AgentInfoManager';
import { TEMPLATE_PATH, AGENT_NAME } from './config';
import { executeShellCommand } from './util/exec';
import { logger } from './util/logger';

const COMMANDS = {
  runTests: (logPath: string) =>
    `/bin/bash -l -c 'rvm use ruby-2.7.0@crm_sync_ma_integration_testing && ` +
    `cd /Users/stepan/code/crm_test && ` +
    `HEADLESS=true rspec spec/artec_orders/pre-release-testing/crm-ma-integration_spec.rb -e "FOR STOCK: order flow with software, accessories, scanners and preset"' > ${logPath} 2>&1`,
};

export async function createServer(): Promise<express.Express> {
  const infoManager = await AgentInfoManager.create();
  const app = express();

  app.use(expressLoggerMiddleware({ logger }));

  app.get('/', async (_, response) => {
    if ((await infoManager.getInfo()).busy) {
      response.status(200).send("Sod off, I'm busy, m8");
      return;
    }

    const logPath = await infoManager.allocateLogPath();
    const commandToExecute = COMMANDS.runTests(logPath);

    logger.info('Started executing', { commandToExecute, logPath });

    const exitCode = await executeShellCommand(commandToExecute);

    await infoManager.updateInfo({
      busy: false,
      currentCommand: '',
      logPath: '',
    });

    response.status(200).send(`${exitCode}`);
  });

  app.get('/log.html', async (_, response) => {
    const { logPath } = await infoManager.getInfo();
    const indexHTML = await readFile(TEMPLATE_PATH).then((t) =>
      template(t.toString())
    );

    response
      .status(logPath ? 200 : 404)
      .type('html')
      .send(
        indexHTML({ AGENT_NAME, log: logPath && (await readFile(logPath)) })
      );
  });

  app.get('/log.txt', async (_, response) => {
    const { logPath } = await infoManager.getInfo();

    if (!logPath) {
      return response.status(404).send('');
    }

    const stream = createReadStream(logPath);

    stream.on('data', (chunk) => response.write(chunk));
    stream.once('close', () => response.status(200).end());
  });

  app.get('/agent-info.json', async (_, response) => {
    response.status(200).json(await infoManager.getInfo());
  });

  return app;
}

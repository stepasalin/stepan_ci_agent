const redis = require('redis');
const redisClient = redis.createClient();
const express = require('express');
const app = express();
const port = 5000;
const { readFile } = require('fs-extra');
const { exec } = require('child_process');
const logger = require('pino')({ prettyPrint: true })


const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        resolve(`${error.code}`);
      }
      resolve('0');
    });
  });
}

const agentName = process.env.AGENT_NAME;
if (agentName) {
  logger.info(`Starting agent ${agentName}`);
} else {
  throw new Error('Agent name not set');
}

const defaultAgentInfo = {
  busy: false,
  currentCmd: '',
  agentName: agentName,
  logPath: '',
};

function updateAgentInfo(someAgentInfo) {
  redisClient.set(agentName, JSON.stringify(someAgentInfo));
}

updateAgentInfo(defaultAgentInfo);

app.use(require('express-pino-logger')())

app.get('/', (request, response) => {
  redisClient.get(agentName, (_, redisReply) => {
    currentAgentInfo = JSON.parse(redisReply);
    if (currentAgentInfo.busy) {
      logger.info('I am busy, go away');
      response.send('I am busy, go away');
    } else {
      logPath = `/tmp/${generateString(8)}.log`;
      cmdLine = `/bin/bash -l -c 'rvm use ruby-2.7.0@crm_sync_ma_integration_testing && HEADLESS=true rspec spec/artec_orders/pre-release-testing/crm-ma-integration_spec.rb -e "FOR STOCK: order flow with software, accessories, scanners and preset"' > ${logPath} 2>&1`;
      currentAgentInfo.busy = true;
      currentAgentInfo.currentCmd = cmdLine;
      currentAgentInfo.logPath = logPath;
      updateAgentInfo(currentAgentInfo);
      logger.info('started executing ' + cmdLine);
      execShellCommand(cmdLine).then((outCode) => {
        currentAgentInfo.busy = false;
        currentAgentInfo.currentCmd = '';
        currentAgentInfo.logPath = '';
        updateAgentInfo(currentAgentInfo);
        response.send(outCode);
      });
    }
  });
});

app.get('/agent_info.json', (_, response) => {
  redisClient.get(agentName, (_, redisReply) => {
    response.json(JSON.parse(redisReply));
  });
});

app.get('/current_log', (request, response) => {
  redisClient.get(agentName, async (_, redisReply) => {
    const { logPath } = JSON.parse(redisReply);
    const log = await readFile(logPath);
    response.send(log);
  });
});

app.listen(port, (err) => {
  if (err) {
    return logger.info('something bad happened', err);
  }
  logger.info(`server is listening on ${port}`);
});

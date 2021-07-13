const redis = require("redis");
const redis_client = redis.createClient();
const express = require('express')
const app = express();
const port = 5000;

function execShellCommand(cmd) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
   exec(cmd, (error, stdout, stderr) => {
    if (error) {
     resolve(`${error.code}`)
    }
    resolve('0');
   }); 
  });
 }

const agentName = process.env.AGENT_NAME;
if(agentName) {
  console.log(`Starting agent ${agentName}`)
} else {
  throw('Agent name not set')
}

const defaultAgentInfo = {
  busy: false,
  currentCmd: '',
  agentName: agentName
}

function updateAgentInfo(someAgentInfo) {
  redis_client.set(agentName, JSON.stringify(someAgentInfo));
};

updateAgentInfo(defaultAgentInfo);

app.get('/', (request, response) => {
    redis_client.get(agentName, (redis_err, redis_reply) => {
      currentAgentInfo = JSON.parse(redis_reply);
      if (currentAgentInfo.busy) {
        console.log('I am busy, go away');
        response.send('I am busy, go away');
      }
      else {
        cmdLine = "/bin/bash -l -c 'rvm use ruby-2.7.0@crm_sync_ma_integration_testing && cd /Users/stepan/code/crm_test/ && HEADLESS=true rspec spec/artec_orders/pre-release-testing/playground.rb' > /tmp/out 2>&1"
        currentAgentInfo.busy = true;
        currentAgentInfo.currentCmd = cmdLine;
        updateAgentInfo(currentAgentInfo);
        console.log('started executing ' + cmdLine)
        execShellCommand(cmdLine).then( (out_code) => {
          currentAgentInfo.busy = false;
          currentAgentInfo.currentCmd = '';
          updateAgentInfo(currentAgentInfo);
          response.send(out_code);
        }
        )
      }
    }  
  )
});

app.get('/agent_info.json', (request, response) => {
  redis_client.get(agentName, (redis_err, redis_reply) => {
    response.json(JSON.parse(redis_reply));
  }
  )
}
)
app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
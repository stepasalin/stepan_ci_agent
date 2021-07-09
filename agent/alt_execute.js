const http = require('http');
const redis = require("redis");
const redis_client = redis.createClient();
const express = require('express')
const app = express();
const port = 5000;

const agentName = process.env.AGENT_NAME;
if(agentName) {
  console.log(`Starting agent ${agentName}`)
} else {
  throw('Agent name not set')
}

const agentInfo = {
  busy: false,
  currentCmd: '',
  agentName: agentName
}

redis_client.set(agentName, JSON.stringify(agentInfo));

function execShellCommand(cmd) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
   exec(cmd, (error, stdout, stderr) => {
    if (error) {
     console.warn(error);
    }
    resolve(stdout? stdout : stderr);
   }); 
  });
 }


app.get('/', (request, response) => {
    redis_client.get(agentName, (err, reply) => {
      currentAgentInfo = JSON.parse(reply);
      if (currentAgentInfo.busy) {
        response.send('I am busy, go f yourself');
      }
      else {
        currentAgentInfo.busy = true;
        redis_client.set(agentName, JSON.stringify(currentAgentInfo));
        execShellCommand('sleep 30; ls -la').then( (output) => {
          currentAgentInfo.busy = false;
          redis_client.set(agentName, JSON.stringify(currentAgentInfo));
          response.send(output);
        }
        )
      }
    }  
  )
});

app.get('/agent_info.json', (request, response) => {
  redis_client.get(agentName, (err, reply) => {
    response.json(JSON.parse(reply));
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

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   execShellCommand('sleep 30l; ls -la').then( (output) => {
//     res.end(output + agentInfo)
//   }
//   );
//   // exec('sleep 10;ls -la', (error, stdout, stderr) => {
//   //     res_obj = {'stdout': stdout, 'stderr': stderr, 'error': error}
//   //     res.end(stdout)
//   // } )
// });

// server.listen(5000);
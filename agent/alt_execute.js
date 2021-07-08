const http = require('http');

const agentName = process.env.AGENT_NAME;
if(agentName) {
  console.log(`Starting agent ${agentName}`)
} else {
  throw('Agent name not set')
}

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


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  execShellCommand('ls -la').then( (output) => {
    res.end(output)
  }
  );
  // exec('sleep 10;ls -la', (error, stdout, stderr) => {
  //     res_obj = {'stdout': stdout, 'stderr': stderr, 'error': error}
  //     res.end(stdout)
  // } )
});

server.listen(5000);
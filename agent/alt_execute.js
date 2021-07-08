const http = require('http');

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


 execShellCommand('ls -la').then( (ret) => {
  console.log(ret);
});

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
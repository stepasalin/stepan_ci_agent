const { exec } = require("child_process");
const { Console } = require("console");
const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    exec('sleep 60;ls -la', (error, stdout, stderr) => {
        res_obj = {'stdout': stdout, 'stderr': stderr, 'error': error}
        res.end(stdout)
    } )
  });

server.listen(5000);



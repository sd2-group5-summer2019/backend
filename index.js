const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const http = require('http');
const nconf = require('nconf');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

nconf.argv({
    'p': {
        'alias': 'http:port',
        'describe': 'The port to listen on'
    }
});
  
nconf.env("__");
nconf.file('./config/config.json');
  
nconf.defaults({
    "http": {
        "port": 3001
    }
});  


app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRoutes);

var server = http.createServer(app);
app.set('port', nconf.get('http:port'));
server.listen(nconf.get("http:port"));

server.on('listening', onListening);

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
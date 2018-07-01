#!/usr/bin/env node

const path = require('path');
const http = require('http');
const config = require('config');
const logger = require('./common/helpers/logger');
const debugLog = logger.debug('server');
const infoLog = logger.info('server');
const errorLog = logger.error('server');

infoLog(`Starting service ${config.get('name')} in "${process.env.NODE_ENV}" mode`);

const app = require('./app');

let retryLatency = 1000;
let incLatency = Math.floor(100 * Math.random() + 500);
let retry = 1;

/**
 * Event listener for HTTP server "error" event.
 */
const onError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const port = app.get('port');
  const bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      errorLog(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      errorLog(`${bind} is already in use, retrying #${retry++} in ${Math.floor(retryLatency/100)/10}s...`);
      setTimeout(() => {
        server.close();
        infoLog(`Retry to start server`);
        server.listen(app.get('port'), app.get('host'));
      }, retryLatency);
      if (retryLatency < 15000) {
        retryLatency += incLatency;
        incLatency += Math.floor(10 * Math.random() + 245);
      }
      else {
        retryLatency = Math.floor(5000 * Math.random() + 12500);
        incLatency = Math.floor(100 * Math.random() + 500);
      }
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const infoPath = path.join(app.get('basePath'), 'info');
  const host = app.get('host');
  const addr = server.address();
  if (typeof addr === 'string') {
    infoLog(`Server is listening ${host} on pipe ${addr}`);
  }
  else {
    infoLog(`Server is listening ${host} on port ${addr.port}`);
    infoLog(`curl ${addr.address}:${addr.port}${infoPath}`);
  }
};

// Create HTTP server.
const server = http.createServer(app);
// Listen on provided port, on all network interfaces.
server.on('error', onError);
server.on('listening', onListening);
server.listen(app.get('port'), app.get('host'));
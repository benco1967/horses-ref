'use strict';

const express = require('express');
const config = require('config');
const logger = require('./common/helpers/logger');
const reqCustom = require('req-custom');
const path = require('path');
const routeLogger = require('morgan');
const BodyParser = require('body-parser');
const createError = require('http-errors');

const name = config.get('name');
const debugLog = logger.debug(`app`);

debugLog(`Service is initializing`);

const server = express();


/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = value => {
  const port = parseInt(value, 10);

  if (isNaN(port)) {
    // named pipe
    return value;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};


const init = () => {
  // set the view engine to ejs
  server.set('view engine', 'ejs');

  server.set('host', config.get('host'));
  server.set('port', normalizePort(config.get('port')));
  server.set('basePath',  path.join('/', config.get('basePath')));

  if (process.env.NODE_ENV !== 'test') server.use(routeLogger('combined'));
  server.use(reqCustom());
  server.use(BodyParser.json());

  server.use(express.static(path.join(__dirname, 'public')));
  server.use('/ui/', express.static(path.join(__dirname, 'ui')));

  const routes = require('./api/routes');
  server.use('/', routes);

  server.use(() => {
    throw new createError.NotFound();
  });

  server.use(require('./api/controllers/errorHandler'));
};

init(server);

debugLog(`Service ${name} initialized`);

module.exports = server;

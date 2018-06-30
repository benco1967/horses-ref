'use strict';

const express = require('express');
const config = require('config');
const errorHandler = require('./errorHandler');
const logger = require('./common/helpers/logger');
const reqCustom = require('req-custom');
const path = require('path');
const favicon = require('serve-favicon');
const routeLogger = require('morgan');
const BodyParser = require('body-parser');
const createError = require('http-errors');

const name = config.get('name');
const info = logger.info(`server`);
const error = logger.error(`server`);

const server = express();


/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const init = () => {

  info(`Service ${name} is starting in "${process.env.NODE_ENV}" mode`);

  server.set('host', config.get('host'));
  server.set('port', normalizePort(config.get('port')));
  server.set('basePath', config.get('basePath'));

  server.use(routeLogger('combined'));
  server.use(reqCustom());
  server.use(BodyParser.json());

  server.use(express.static(path.join(__dirname, 'public')));

  const routes = require('./api/routes');
  server.use('/', routes);

  server.use(() => {
    throw new createError.NotFound();
  });

  server.use(errorHandler);
};

const start = () => {
  const host = server.get('host');
  const port = server.get('port');
  const basePath = server.get('basePath');
  server.listen(port, host, err => {
    if (err) {
      error(`Unable to start server on ${host}:${port}/${basePath}`);
      error(err);
      throw(err);
    }
    info(`Server is listening on ${host}:${port}/${basePath}`);
    info(`curl ${host}:${port}/${basePath}`);
  });

};



init(server);

module.exports = server;

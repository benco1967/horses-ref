'use strict';
const config = require('config');
const debug = require('debug');

const logger = (id) => debug(config.get('name') + ":" + id);

module.exports = {
  logger,
  debug: (id) => logger('debug:' + id),
  info: (id) => logger('info:' + id),
  warn: (id) => logger('warn:' + id),
  error: (id) => logger('error:' + id),
}
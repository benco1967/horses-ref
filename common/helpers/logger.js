'use strict';
const config = require('config');
const debug = require('debug');

const logger = (id) => debug(config.get('name') + ":" + id);

module.exports = {
  logger,
  debug: (id) => logger('debug:' + id),
  info: (id) => logger('debug:' + id),
  warn: (id) => logger('debug:' + id),
  error: (id) => logger('debug:' + id),
}
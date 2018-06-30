
const express = require('express');
const config = require('config');
const errorHandler = require('./errorHandler');
const logger = require('debug');
const routes = require('./routes');
const reqCustom = require('req-custom');
const path = require('path');
const favicon = require('serve-favicon');
const routeLogger = require('morgan');
const BodyParser = require('body-parser');
const createError = require('http-errors');

const name = config.get('name');
const debug = logger(`${name}:server`);
const error = logger(`${name}:server:error`);

const server = express();

const init = () => {

  debug(`Service ${config.get('name')} is starting in "${process.env.NODE_ENV}" mode`);

  server.set('host', config.get('host'));
  server.set('port', config.get('port'));
  server.set('basePath', config.get('basePath'));

  server.set('views', path.join(__dirname, 'views'));
  server.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  server.use(routeLogger('combined'));
  server.use(reqCustom());
  server.use(BodyParser.json());

  server.use(express.static(path.join(__dirname, 'public')));

  /*
  server.use(require('./api/middlewares/customParams'));
  server.use('/', index);
  const infosRouter = require('./api/controllers/infos');
  server.use('/infos', infosRouter());
  const adminRouter = require('./api/controllers/admin');
  server.use('/admin', adminRouter());
  server.param('tenant', require('./api/middlewares/tenantLoader'));
  server.use('/:tenant', tenantRouter);
  */

  server.use(() => {
    console.log("not found");
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
    debug(`Server is listening on ${host}:${port}/${basePath}`);
    debug(`curl ${host}:${port}/${basePath}`);
  });

};

module.exports = {
  init,
  start
};


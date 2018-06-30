'use strict';

const config = require('config');
const statuses = require('statuses');
const logger = require('./common/helpers/logger');
const error = logger.error(`:errorHandle`);

const htmlError = (res, message, status, expose, err) => {
  // set locals, only providing error in development
  res.locals.message = message;
  res.locals.error = expose ? err : {};
  // render the error page
  res.status(status);
  switch (status) {
  case 401:
    res.render('401');
    break;
  case 404:
    res.render('404');
    break;
  default:
    res.render('error');
    break;
  }
};
const jsonError = (res, message, status, expose, err) => {
  if (status === 401) {
    res.set("WWW-Authenticate", `Basic realm="Authentication requise", charset="UTF-8"`);
  }
  res.status(status).json({ status, message: expose ? message : statuses[status] });
};

module.exports = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || statuses[status];
  error(`Error : (${status}) ${message}`);

  switch (req.get('accept')) {
    case 'application/json':
      jsonError(res, message, status, err.expose, err);
      break;
    case 'text/html':
    default:
      htmlError(res, message, status, req.app.get('env') === 'development', err);
  }

};

'use strict';
const checkDB = require('../models/dbConnection').checkDB;

module.exports = () => {
  const dbStatus = {
    id: 'mongodb',
    description: 'Database of the service',
    status: "undefined",
    details: {}
  };
  return checkDB()
    .then(() => {
      dbStatus.status = 'ok';
      return dbStatus;
    })
    .catch(() => {
      dbStatus.status = 'error';
      return dbStatus;
    });
};

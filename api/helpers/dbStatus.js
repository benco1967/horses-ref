'use strict';
const checkDB = require('../models/dbConnection').checkDB;

module.exports = async () => {
  let status = "undefined";
  try {
    await checkDB();
    status = 'ok';
  }
  catch {
    status = 'error';
  }
  return  {
    id: 'mongodb',
    description: 'Database of the service',
    details: {},
    status
  };
};

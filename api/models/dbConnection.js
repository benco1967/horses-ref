'use strict';

const mongoose = require('mongoose');
const debug = require('debug')("horsesRef:db");
const error = require('debug')("horsesRef:error:db");
const UNABLE_TO_CONNECT = require('../helpers/errorCodes').UNABLE_TO_CONNECT;


// Use native promises fo mongoose
mongoose.Promise = global.Promise;

//configuration de connexion la la bdd
const dbConfig = require('config').get('db');

const options = {
  //autoIndex: false, // Don't build indexes
  //reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  //reconnectInterval: 500, // Reconnect every 500ms
  //poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  //bufferMaxEntries: 0
};

// Build the connection string
const uri = `mongodb://${dbConfig.user}:${dbConfig.pwd}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;

debug(`db uri ${uri}`);

const errorHandler = err => {
  error(`Mongoose default connection error: ${err && err.message && JSON.stringify(err) || err}`);
};
const disconnectHandler = () => {
  debug('Mongoose default connection disconnected');
};

const openDB = () => {
  debug(`connecting to db ${uri}`);
  // Connect then store the promise as result
  return mongoose.connect(uri, options)
    .then(() => {
      debug("connected to the db with the default connection");

      mongoose.connection
        .removeListener('error', errorHandler)
        .on('error', errorHandler) // If the connection throws an error
        .removeListener('disconnected', disconnectHandler)
        .on('disconnected', disconnectHandler);// When the connection is disconnected
    });
};

const checkDB = () =>
  mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2 ?
  Promise.resolve() :
  openDB()
    .then(() => {})
    .catch(err => {
      error(`Mongo error: ${err && err.message && JSON.stringify(err) || err}`);
      throw { name: "DBConnectionError", code: UNABLE_TO_CONNECT, message: "failed to connect to the db server" }
    });



module.exports = {
  uri,
  options,
  checkDB,
  openDB,
};

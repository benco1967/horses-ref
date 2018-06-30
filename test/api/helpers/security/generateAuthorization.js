
const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('config');

const initKey = (parameters) => {
  let q = null;
  if (parameters && parameters.secret || config.has('sign.secret')) {
    q = Promise.resolve(parameters && parameters.secret || config.get('sign.secret'));
  }
  else if (parameters && parameters.secretPath || config.has('sign.secretPath')) {
    q = new Promise((resolve, reject) => {
      fs.readFile(parameters && parameters.secretPath || config.get('sign.secretPath'), (err, data) => {
        if (err) {
          reject(Error('Unable to read the jwt secret file'))
        }
        else {
          resolve(data);
        }
      });
    });
  }
  else if (parameters && parameters.secretUrl || config.has('sign.secretUrl')) {
    q = Promise.reject(Error('Not implemented yet'));
  }
  else {
    q = Promise.reject(Error('No authentication key provided'));
  }
  return q
    .then(secret => {
      const payload = parameters && parameters.payload || config.get('sign.payload');
      const options = parameters && parameters.options || config.get('sign.options');
      const token = `Bearer ${jwt.sign(payload, secret, options)}`;
      console.log(token);
      return token;
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
};
module.exports = initKey;

initKey();

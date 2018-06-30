'use strict';
module.exports = {
  get: (req, ...names) => {
    let custom = req[Symbol.for(names[0])] || null;
    for(let i = 1; i < names.length; i++) {
      custom = custom && custom[names[i]] || null;
    }
    return custom;
  },
  create: (req, name, value) => {
    req[Symbol.for(name)] = value;
    return value;

  },
  remove: (req, name) => {
    const tenant = req[Symbol.for(name)];
    delete req[Symbol.for(name)];
    return tenant;
  },
  has: (req, name) => {
    return !!req[Symbol.for(name)];
  }
};
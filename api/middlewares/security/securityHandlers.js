'use strict';
const bearerSecurityHandler = require('./bearerSecurityHandler');
const basicSecurityHandler = require('./basicSecurityHandler');
/**
 * Handler pour le securityDefinitions Bearer
 * Si d'autres modèles de sécurités sont créés il faut les ajouter ici
 */
module.exports = (parameters) => ({
  Bearer: bearerSecurityHandler.Bearer(parameters),
  BearerAdm: bearerSecurityHandler.BearerAdm(parameters),
  Basic: basicSecurityHandler.Basic(parameters),
  BasicAdm: basicSecurityHandler.BasicAdm(parameters),
});

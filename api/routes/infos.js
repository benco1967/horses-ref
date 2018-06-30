'use strict';

const express = require('express');
const infoController = require('../controllers/infos');

const logger = require('../../common/helpers/logger');
const info = logger.info(`routes`);

const infosRouter = express.Router();

info(`create infos router`);

infosRouter.use((req, res, next) => {
  console.log('infosRouter');
  next();
});
/**
 * API de'entrée
 */
infosRouter.get('/', infoController.root);
/**
 * API retournant la version de ce service
 */
infosRouter.get('/version', infoController.version);
/**
 * API retournant le status
 */
infosRouter.get('/status', infoController.status);
/**
 * API retournant la license
 */
infosRouter.get('/license', infoController.license);

/**
 * API retournant les roles
 */
infosRouter.get('/roles', infoController.roles);

module.exports = infosRouter;
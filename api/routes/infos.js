'use strict';

const express = require('express');

const logger = require('../../common/helpers/logger');
const debugLog = logger.debug(`infos-routes`);

debugLog(`Creating infos router`);

const infoController = require('../controllers/infos');
const infosRouter = express.Router();

// API de'entrée
infosRouter.get('/', infoController.root);

// API retournant la version de ce service
infosRouter.get('/version', infoController.version);

// API retournant le status
infosRouter.get('/status', infoController.status);

// API retournant la license
infosRouter.get('/license', infoController.license);

// API retournant les roles
infosRouter.get('/roles', infoController.roles);

debugLog(`Infos router created`);

module.exports = infosRouter;
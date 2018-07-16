'use strict';

const express = require('express');

const logger = require('../../common/helpers/logger');
const debugLog = logger.debug(`infos-routes`);

debugLog(`Creating infos router`);

const controller = require('../controllers/adminInfos');
const infosRouter = express.Router();

// API de'entrée
infosRouter.get('/', controller.root);

// API retournant la version de ce service
infosRouter.get('/version', controller.version);

// API retournant le status
infosRouter.get('/status', controller.status);

// API retournant la license
infosRouter.get('/license', controller.license);

// API retournant les roles
infosRouter.get('/roles', controller.roles);

debugLog(`Infos router created`);

module.exports = infosRouter;
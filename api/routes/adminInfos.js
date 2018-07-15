'use strict';

const express = require('express');

const logger = require('../../common/helpers/logger');
const debugLog = logger.debug(`infos-routes`);

debugLog(`Creating infos router`);

const infosController = require('../controllers/adminInfos');
const infosRouter = express.Router();

// API de'entrée
infosRouter.get('/', infosController.root);

// API retournant la version de ce service
infosRouter.get('/version', infosController.version);

// API retournant le status
infosRouter.get('/status', infosController.status);

// API retournant la license
infosRouter.get('/license', infosController.license);

// API retournant les roles
infosRouter.get('/roles', infosController.roles);

debugLog(`Infos router created`);

module.exports = infosRouter;
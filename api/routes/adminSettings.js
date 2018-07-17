'use strict';
const express = require('express');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const controller = require('../controllers/adminSettings');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm'], config.get('security'));
const bearer  = security.Bearer(['adm'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

// API retournant les settings
router.get('/', controller.getSettings);

// API mettant à jour les settings
router.put('/', controller.updateSettings);

debugLog(`Admin settings router created`);

module.exports = router;

'use strict';
const express = require('express');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const controller = require('../controllers/horses');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm', 'mng', 'usr'], config.get('security'));
const bearer  = security.Bearer(['adm', 'mng', 'usr'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

// API retournant les chevaux
router.get('/horses', controller.getHorses);

// API créant un cheval
router.post('/horses', controller.createHorse);

// API retournant un cheval
router.get('/horses/:horseId', controller.getHorse);

// API mettant à jour un cheval
router.put('/horses/:horseId', controller.updateHorse);
router.patch('/horses/:horseId', controller.updateHorse);

debugLog(`Horses router created`);

module.exports = router;

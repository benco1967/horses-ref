'use strict';
const express = require('express');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const adminController = require('../controllers/admin');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm'], config.get('security'));
const bearer  = security.Bearer(['adm'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

// API retournant les settings
router.get('/settings', adminController.getSettings);

// API mettant à jour les settings
router.put('/settings', adminController.updateSettings);

// API retournant les tenants
router.get('/tenants', adminController.getTenants);

// API creant un tenant
router.post('/tenants', adminController.createTenant);

// API retournant les settings d'un tenant
router.get('/tenants/:tenant/settings', adminController.getTenantSettings);

// API mettant à jour les settings d'un tenant
router.put('/tenants/:tenant/settings', adminController.updateTenantSettings);

debugLog(`Admin router created`);

module.exports = router;

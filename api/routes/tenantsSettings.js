'use strict';
const express = require('express');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const controller = require('../controllers/tenantsSettings');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm', 'mng'], config.get('security'));
const bearer  = security.Bearer(['adm', 'mng'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

// API retournant les settings
router.get('/settings', controller.getTenantSettings);

// API mettant à jour les settings
router.put('/settings', controller.updateTenantSettings);

// API retournant le mapping des roles
router.get('/rolemapping', controller.getTenantGroupRoleMapping);

// API mettant à jour le mapping des roles
router.put('/rolemapping', controller.updateTenantGroupRoleMapping);

debugLog(`Tenant settings router created`);

module.exports = router;

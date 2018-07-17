'use strict';
const express = require('express');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const controller = require('../controllers/adminTenants');
const tenants = require('../models/tenant');
const tenantLoader = require('loader-mw');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm'], config.get('security'));
const bearer  = security.Bearer(['adm'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

// API retournant les tenants
router.get('/', controller.getAllTenants);

// API creant un tenant
router.post('/', controller.createTenant);



router.param('tenant', tenantLoader(id => tenants.get(id)));

router.use('/:tenant/settings', require('../middlewares/tenantDisabler')(false));
// API retournant les settings d'un tenant
router.get('/:tenant/settings', controller.getAdminTenantSettings);

// API mettant à jour les settings d'un tenant
router.put('/:tenant/settings', controller.updateAdminTenantSettings);


debugLog(`Admin tetant router created`);

module.exports = router;

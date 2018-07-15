'use strict';
const express = require('express');

const tenants = require('../models/tenant');
const tenantLoader = require('loader-mw');

const logger = require('../../common/helpers/logger');
const config = require('config');
const debugLog = logger.debug(`admin-routes`);

debugLog(`Creating admin router`);

const adminController = require('../controllers/adminTenants');
const router = express.Router();

// Access control
const security  = require('security-mw');
const basic  = security.Basic(['adm'], config.get('security'));
const bearer  = security.Bearer(['adm'], config.get('security'));
const securityHandler = security.security(basic, bearer);

router.use('/', securityHandler);

router.use('/', (req, res, next) => {
  console.log(`>>>>>>>>>>>>>>>>>>>>>`);
  next();
});

// API retournant les tenants
router.get('/', adminController.getAllTenants);

// API creant un tenant
router.post('/', adminController.createTenant);

router.param('tenant', tenantLoader(id => {
  console.log(`tenant loader ${id}`);
  return tenants.get(id);
}));
router.use('/:tenant/settings', require('../middlewares/tenantDisabler')(false));
// API retournant les settings d'un tenant
router.get('/:tenant/settings', adminController.getAdminTenantSettings);

// API mettant à jour les settings d'un tenant
router.put('/:tenant/settings', adminController.updateAdminTenantSettings);

router.use('/', (err, req, res, next) => {
  console.log(`>>>>>>>>>>>>>>>>>>>>> ${JSON.stringify(err)}`);
  console.error(err);
  next(err);
});

debugLog(`Admin router created`);

module.exports = router;

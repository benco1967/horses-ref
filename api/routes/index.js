'use strict';

const express = require('express');
const logger = require('../../common/helpers/logger');
const tenants = require('../models/tenant');
const tenantLoader = require('loader-mw');

const debugLog = logger.debug(`router`);
debugLog(`API is initializing`);

/*
const horsesRouter = require('./routes/horses');
*/


const router = express.Router();

/*// Horses

router.use(`:tenant/horses`, horsesRouter);
*/


// Admin tenants
router.use(`/admin/tenants`, require('./adminTenants'));

// Admin settings
router.use(`/admin/settings`, require('./adminSettings'));

// Admin infos
router.use('/admin', require('./adminInfos'));


router.param('tenant', tenantLoader(id => tenants.get(id)));
router.use('/:tenant', require('../middlewares/tenantDisabler')(true));
// Setting
router.use(`/:tenant`, require('./tenantsSettings'));

debugLog(`API initialized`);

module.exports = router;

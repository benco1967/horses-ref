'use strict';

const express = require('express');
const logger = require('../../common/helpers/logger');
//const tenantLoader = require('loader-mw');

const debugLog = logger.debug(`router`);
debugLog(`API is initializing`);

/*
const horsesRouter = require('./routes/horses');
*/


const router = express.Router();

/*// Horses
router.param('tenant', tenantLoader({
  accessorFn : id => tenantService.getTenant(id)
}));

router.use(`:tenant/horses`, horsesRouter);
// Setting
router.use(`:tenant/`, tenantSettingsRouter);
*/

// Admin tenants
router.use(`/admin/tenants/`, require('./adminTenants'));

// Admin settings
router.use(`/admin/settings`, require('./adminSettings'));

// Admin infos
router.use('/admin/', require('./adminInfos'));


debugLog(`API initialized`);

module.exports = router;

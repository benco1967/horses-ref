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

// Admin
router.use(`/admin/`, require('./admin'));

// Info
router.use('/infos/', require('./infos'));


debugLog(`API initialized`);

module.exports = router;

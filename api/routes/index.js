'use strict';

const express = require('express');
const logger = require('../../common/helpers/logger');
const tenantLoader = require('loader-mw');
const NotFound = require('http-errors').NotFound;
/*
const horsesRouter = require('./routes/horses');
const adminRouter = require('./routes/admin');
*/
const infosRouter = require('./infos');
const info = logger.info(`router`);
info(`API is initializing`);

const router = express.Router();

router.use((req, res, next) => {
  console.log('router');
  next();
});
/*// Horses
router.param('tenant', tenantLoader({
  accessorFn : id => tenantService.getTenant(id)
}));

router.use(`:tenant/horses`, horsesRouter);
// Setting
router.use(`:tenant/`, tenantSettingsRouter);
// Admin
router.use(`admin`, adminRouter);
*/
// Info
router.use('/infos/', infosRouter);

module.exports = router;

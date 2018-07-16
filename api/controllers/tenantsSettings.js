'use strict';

const config = require('config');
const createError = require('http-errors');

const logger = require('../../common/helpers/logger');
const errorLog = logger.error(`tenant-controller`);

const tenants = require('../models/tenant');
const groupRoleMappingValidator = require('../../common/models/groupRoleMapping').validator;

const getTenantNode = (node) => (req, res, next) => {
  const tenant = req.getPrm('tenant', 'value');
  if(tenant !== null) {
    res.status(200).json(tenant[node] || {});
  }
  else {
    errorLog(`Unable to get tenant.${node}: ${err.message}`);
    next(req.getPrm('tenant', 'err'));
  }
};

module.exports = {

  getTenantSettings: getTenantNode('settings'),

  updateTenantSettings: (req, res, next) => {
    const tenantId = req.getPrm('tenant', 'value', 'id');
    const settings = req.body;
    tenants.update(tenantId, 'settings', settings)
      .then(settings => {
        res.status(200).json(settings);
      })
      .catch(err => {
        errorLog(`Unable to get tenant.settings: ${err.message}`);
        next(err);
      });
  },

  getTenantGroupRoleMapping: getTenantNode('groupRoleMapping'),

  updateTenantGroupRoleMapping: (req, res, next) => {
    const tenantId = req.getPrm('tenant', 'value', 'id');
    const groupRoleMapping = req.body;
    groupRoleMappingValidator(false)(groupRoleMapping)
      .catch(err => {
        throw createError.BadRequest(err);
      })
      .then(() =>
        tenants.update(tenantId, 'groupRoleMapping', groupRoleMapping)
      )
      .then(groupRoleMapping => {
        res.status(200).json(groupRoleMapping);
      })
      .catch(err => {
        errorLog(`Unable to get tenant.groupRoleMapping: ${err.message}`);
        next(err);
      });
  },
};

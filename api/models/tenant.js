'use strict';

const createError = require('http-errors');
const mongoose = require('mongoose');
const groupRoleMapping = require('../../common/models/groupRoleMapping').schema(false);
const checkDB = require('./dbConnection').checkDB;
const Tenant = require('../../common/models/tenant');

const logger = require('../../common/helpers/logger');
const debug = logger.debug("tenant");
const error = logger.error("tenant");

// Definitions du modele
const tenantSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    texts: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiredAt: {
      type: Date,
    },
    enable: {
      type: Boolean,
      required: true,
    },
    lang: {
      type: String,
      required: true,
      default: true,
    },
    contacts: {
      type: [{
        type: String,
        lowercase: true,
        trim: true,
      }],
      required: true,
    },
    groupRoleMapping,
    authentication: [{ mode: String, options: mongoose.Schema.Types.Mixed }],
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    adminSettings:  {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  });

// Models are created from schemas using the mongoose.model() method:
const TenantModel = mongoose.model('tenant', tenantSchema , 'tenants');


const getAll = () =>
  checkDB()
    .then(() => TenantModel.find({}));

const get = (idTenant, proj) =>
  checkDB()
    .then(() => {
      let projection = undefined;
      if(proj !== undefined) {
        projection = {};
        projection[proj] = 1;
      }
      return TenantModel.findOne({id: idTenant}, projection);
    })
    .then(tenant => {
      if (tenant === null) throw new createError.NotFound("No such tenant");

      return tenant;
    });

const update = (idTenant, proj, value) =>
  checkDB()
    .then(() => {
      const update = { $set: {} };
      update.$set[proj] = value;
      return TenantModel.findOneAndUpdate({id: idTenant}, update, { new: true });
    })
    .then(tenant => {
      if (tenant === null) throw new createError.NotFound("No such tenant");

      return tenant[proj];
    });

/**
 * Create an empty tenant with the given id and description.
 * If the tenant already exists throws an exception with the appropriate code and message
 * @param tenantId id for the new tenant
 * @param description for the new tenant as a locale string
 * @param contacts for the tenant, an array of strings
 * @returns {Promise} a promise resolved to the new tenant if creation succeeded
 */
const create = (tenantId, description, contacts) =>
  checkDB()
    .then(() => TenantModel.findOne({id: tenantId}, {id: 1}))
    .then(tenant => {
      if (tenant !== null) {
        error(`try to create the tenant "${tenantId}" that already exists`);
        throw new createError.Conflict("Already defined");
      }
      if (tenantId === 'admin') {
        error(`try to create the tenant "${tenantId}" but this id is reserved`);
        throw new createError.Conflict("Forbidden id");
      }
      debug(`create the tenant "${tenantId}"`);
      return TenantModel.create(new Tenant(tenantId, description, contacts));
    });

// make this available to our tenant in our Node applications
module.exports = {
  model: TenantModel,
  getAll,
  get,
  create,
  update,
};

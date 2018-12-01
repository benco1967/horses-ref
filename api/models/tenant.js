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


const getAll = async () => {
  await checkDB();
  return TenantModel.find({});
};

const get = async (idTenant, proj) => {
  await checkDB();
  let projection = undefined;
  if (proj !== undefined) {
    projection = {};
    projection[proj] = 1;
  }
  const tenant = await TenantModel.findOne({id: idTenant}, projection);
  if (tenant === null) throw new createError.NotFound("No such tenant");
  return tenant;
};

const update = async (idTenant, proj, value) => {
  await checkDB();
  const update = {$set: {}};
  update.$set[proj] = value;
  const tenant = await TenantModel.findOneAndUpdate({id: idTenant}, update, {new: true});
  if (tenant === null) throw new createError.NotFound("No such tenant");
  return tenant[proj];
};

/**
 * Create an empty tenant with the given id and description.
 * If the tenant already exists throws an exception with the appropriate code and message
 * @param tenantId id for the new tenant
 * @param description for the new tenant as a locale string
 * @param contacts for the tenant, an array of strings
 * @returns {Promise} a promise resolved to the new tenant if creation succeeded
 */
const create = async (tenantId, description, contacts) => {
  await checkDB();
  const tenant = await TenantModel.findOne({id: tenantId}, {id: 1});
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
};

// make this available to our tenant in our Node applications
module.exports = {
  model: TenantModel,
  getAll,
  get,
  create,
  update,
};

'use strict';

const error = require('../helpers/errorCodes').error;
const BAD_REQUEST = require('../helpers/errorCodes').BAD_REQUEST;
const NOT_FOUND = require('../helpers/errorCodes').NOT_FOUND;
const checkDB = require('./dbConnection').checkDB;
const jsonpatch = require('fast-json-patch');
const uuid = require('uuid/v4');
const Ajv = require('ajv');
const ajv = new Ajv();
const patchModel = require('./patchModel');
const validateJsonPatch = patchModel.validateJsonPatch;

const horseSchema = require('./horseSchema');
// Models are created from schemas using the mongoose.model() method:
const horsePatchModel = patchModel.objectPatchModel('horsePatches');

const getAll = (tenantId) => checkDB()
  .then(() => horsePatchModel
    .aggregate()
    .match({ tenantId })  // recherche tous les patch sur le cheval
    .sort({ date: 1 })      //trie les resultats par date
    .unwind("$patch")      //applati tous les patch
    .group({ _id: "$id", patch: { $push:"$patch" } }) // regroupe tous les patch en un tableau
    .exec())
  .then(result => {
    const horses = [];
    for(let r of result) {
      horses.push(jsonpatch.applyPatch({ tenantId, id: r._id }, r.patch).newDocument);
    }
    return horses;
  });
/**
 *
 */
const get = (tenantId, id) => checkDB()
  .then(() => horsePatchModel
    .aggregate()
    .match({ tenantId, id })  // recherche tous les patches sur le cheval
    .sort({ date: 1 })      //trie les resultats par date
    .unwind("$patch")      //applati tous les patch
    .group({ _id: "$id", patch: { $push:"$patch" } }) // regroupe tous les patch en un tableau
    .exec())
  .then(result => {
    if(result === null || result.length === 0) {
      // No such horse
      return null;
    }
    if(result.length !== 1) {
      throw error(BAD_REQUEST, `Horses db integrity error ${id} (${result.length})`);
    }
    //reconstruction du cheval
    return jsonpatch.applyPatch({ tenantId, id }, result[0].patch).newDocument;
  });

const createPatch = (horseId, tenantId, userId, prevHorse, newHorse) => {
  const patch = jsonpatch.compare(prevHorse, newHorse);
  return patch.length === 0 ?
    Promise.resolve(prevHorse.id) :
    horsePatchModel.create({
      id: horseId,
      tenantId,
      userId,
      date: new Date(),
      patch,
    })
      .then((entry) => entry.id);
};

const update = (horseId, userId, tenantId, newHorse) => get(tenantId, horseId || newHorse.id || "")
  .then(prevHorse => {
    const defaultHorse = {};
    if (horseId === null) {
      if (prevHorse === null) {
        // ce cheval n'existe pas => on le crée
        prevHorse = {};
        horseId = newHorse.id || uuid();
        defaultHorse.createdAt = new Date();
        defaultHorse.id = horseId;
        defaultHorse.tenantId = tenantId;
      }
      else {
        throw error(BAD_REQUEST, `Horses db integrity error can't create ${newHorse.id} that already exits`);
      }
    }
    else if (prevHorse === null) {
      throw error(NOT_FOUND, `unknow horse`);
    }
    else if (horseId !== newHorse.id) {
      throw error(BAD_REQUEST, `Horses db integrity error ${newHorse.id} (should be ${horseId})`)
    }
    newHorse = Object.assign(defaultHorse, newHorse, { updatedAt: new Date() });

    return createPatch(horseId, tenantId, userId, prevHorse, newHorse);
  });

const patch = (horseId, userId, tenantId, patch) => get(tenantId, horseId || "")
  .then(prevHorse => {
    if (prevHorse === null) {
      throw error(NOT_FOUND, `unknow horse`);
    }
    if (!validateJsonPatch(patch)) {
      throw error(BAD_REQUEST, 'bad patch format');
    }
    const newHorse = jsonpatch.applyPatch(Object.assign({}, prevHorse, { updatedAt: new Date() }), patch).newDocument;
    //TODO check horse schema

    return createPatch(horseId, tenantId, userId, prevHorse, newHorse);
  });

// make this available in our Node applications
module.exports = {
  validator: ajv.compile(horseSchema),
  getAll,
  get,
  update,
  patch,
};

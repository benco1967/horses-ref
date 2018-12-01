'use strict';


const createError = require('http-errors');
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

const getAll = async tenantId => {
  await checkDB();
  const result = await horsePatchModel
      .aggregate()
      .match({ tenantId })  // recherche tous les patch sur le cheval
      .sort({ date: 1 })      //trie les resultats par date
      .unwind("$patch")      //applati tous les patch
      .group({ _id: "$id", patch: { $push: "$patch" } }) // regroupe tous les patch en un tableau
      .exec();
  const horses = [];
  for(let r of result) {
    horses.push(jsonpatch.applyPatch({ tenantId, id: r._id }, r.patch).newDocument);
  }
  return horses;
};

/**
 *
 */
const get = async (tenantId, id) => {
  await checkDB();
  const result = await horsePatchModel
      .aggregate()
      .match({ tenantId, id })  // recherche tous les patches sur le cheval
      .sort({ date: 1 })      //trie les resultats par date
      .unwind("$patch")      //applati tous les patch
      .group({ _id: "$id", patch: { $push:"$patch" } }) // regroupe tous les patch en un tableau
      .exec();
  if(result === null || result.length === 0) {
    // No such horse
    return null;
  }
  if(result.length !== 1) {
    throw new createError.BadRequest(`Horses db integrity error ${id} (${result.length})`);
  }
  //reconstruction du cheval
  return jsonpatch.applyPatch({ tenantId, id }, result[0].patch).newDocument;
};

const createPatch = async (horseId, tenantId, userId, prevHorse, newHorse) => {
  const patch = jsonpatch.compare(prevHorse, newHorse);
  if (patch.length === 0) return prevHorse.id;
  const entry = await horsePatchModel.create({
      id: horseId,
      tenantId,
      userId,
      date: new Date(),
      patch,
    });
  return entry.id;
};

const update = async (horseId, userId, tenantId, newHorse) => {
  let prevHorse = await get(tenantId, horseId || newHorse.id || "");
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
      throw new createError.BadRequest(`Horses db integrity error can't create ${newHorse.id} that already exits`);
    }
  }
  else if (prevHorse === null) {
    throw new createError.NotFound(`unknow horse`);
  }
  else if (horseId !== newHorse.id) {
    throw new createError.BadRequest(`Horses db integrity error ${newHorse.id} (should be ${horseId})`)
  }
  newHorse = Object.assign(defaultHorse, newHorse, { updatedAt: new Date() });

  return createPatch(horseId, tenantId, userId, prevHorse, newHorse);
};

const patch = async (horseId, userId, tenantId, patch) => {
  const prevHorse = await get(tenantId, horseId || "");
  if (prevHorse === null) {
    throw new createError.NotFound(`unknow horse`);
  }
  if (!validateJsonPatch(patch)) {
    throw new createError.BadRequest('bad patch format');
  }
  const newHorse = jsonpatch.applyPatch(
    { ...prevHorse, ...{ updatedAt: new Date() } },
    patch).newDocument;
  //TODO check horse schema

  return createPatch(horseId, tenantId, userId, prevHorse, newHorse);
};

// make this available in our Node applications
module.exports = {
  validator: ajv.compile(horseSchema),
  getAll,
  get,
  update,
  patch,
};

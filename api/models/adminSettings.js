'use strict';

const debug = require('debug')("horsesRef:admin");
const mongoose = require('mongoose');
const groupRoleMapping = require('./groupRoleMapping').schema(true);
const checkDB = require('./dbConnection').checkDB;

const NOT_FOUND = require('../helpers/errorCodes').NOT_FOUND;

// Definitions du modele
const settings = new mongoose.Schema({
    texts: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    lang: {
      type: String,
      required: true,
      default: true,
    },
    groupRoleMapping,
    authentication: [{ mode: String, options: mongoose.Schema.Types.Mixed }],
  },
  {
    timestamps: true
  });

// Models are created from schemas using the mongoose.model() method:
const adminSettingsModel = mongoose.model('adminSettings', settings , 'adminSettings');

const _newSettings = () =>
  ({
    texts: {
      description: [
        {
          "text": "paramètres de l'administration",
          "locale": "fr"
        }
      ]
    },
    lang: 'fr',
    groupRoleMapping: {
      admin: ["adm"]
    },
    authentication: [],
  });

const _create = () =>
  checkDB()
    .then(() => {
      debug(`created the admin settings`);
      return adminSettingsModel.create(_newSettings());
    });

/**
 *
 * @returns {Promise.<TResult>}
 */
const get = () => checkDB()
    // inutile d'avoir l'id du document car c'est le seul de la collection
    .then(() => adminSettingsModel.findOne({}))
    .then(settings => settings === null ? _create() : settings);


const update = value =>
  get()
    // récupération de seuls champs utiles,
    // la mise à jour de la date de mise à jour est automatique
    .then(settings => Object.assign(settings, {
      texts: value.texts,
      lang: value.lang,
      groupRoleMapping: value.groupRoleMapping,
      authentication: value.authentication,
    }))
    .then(settings => settings.save())
    .then(settings => {
      if (settings === null) throw { name: "DBConnectionError", code: NOT_FOUND, message: "Unable to update the settings" };
      return settings;
    });

// make this available in our Node applications
module.exports = {
  model: adminSettingsModel,
  get,
  update,
};
'use strict';
const adminSettings = require('../models/adminSettings');

module.exports = {
  /**
   * Retourne les paramètres généraux
   * @param req
   * @param res le JSON des paramètres
   * @param next
   */
  getSettings: (req, res, next) => {
    adminSettings.get()
    // suppression des champs inutiles (_v, _id)
      .then(settings => settings.toObject({
          versionKey: false,
          minimize: false,
          transform: (doc, ret) => {
            delete ret._id;
            return ret;
          },
        }))
      .then(settings => {
        res.json(settings);
      })
      .catch(err => {
        errorLog(`Unable to get the settings of the tenant: ${err.message}`);
        next(err);
      });
  },

  /**
   * Met à jour les paramètres généraux
   * @param req contenant le JSON des paramètres
   * @param res contenant le JSON des paramètres modifié
   * @param next
   */
  updateSettings: (req, res, next) => {
    adminSettings.update(req.body)
      .then(settings => {
        res.json(settings);
      })
      .catch(err => {
        errorLog(`Unable to update the settings of the tenant: ${err.message}`);
        next(err);
      });
  },

};
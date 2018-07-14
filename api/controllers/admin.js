'use strict';
const adminSettings = require('../models/adminSettings');
const tenants = require('../models/tenant');

const logger = require('../../common/helpers/logger');
const debugLog = logger.debug(`admin-controller`);

module.exports = {
  /**
   * Retourne les paramètres généraux
   * @param req
   * @param res le JSON des paramètres
   */
  getSettings: (req, res) => {
    debugLog(`call get /settings`);
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
      });
  },

  /**
   * Met à jour les paramètres généraux
   * @param req contenant le JSON des paramètres
   * @param res contenant le JSON des paramètres modifié
   */
  updateSettings: (req, res) => {
    debugLog(`call put /settings`);
    adminSettings.update(req.body)
      .then(settings => {
        res.json(settings);
      });
  },

  /**
   * Retourne les tenants de ce service
   * @param req
   * @param res réponse sous forme d'un tableau de tous les tenants
   *
   */
  getTenants: (req, res) => {
    debugLog(`call get /tenants`);
    // TODO la pagination
    tenants.getAll()
      .then(tenants => {
        res.status(200).json(tenants);
      });
  },

  /**
   * Crée un tenant pour ce service
   * @param req le json contenant l'id et la description du nouveau tenant
   * @param res 201 : créé, 409: erreur car déjà créé, 500: autre erreur
   */
  createTenant: (req, res) => {
    debugLog(`call post /tenants`);

    function addTenantUri(res, idTenant) {
      res.header("link",
        new links()
          .add({
            href: `${url}/admin/tenants/${idTenant}`,
            rel: "self",
            title: "Reference to the tenant uri",
            name: "tenant",
            method: "GET",
            type: "application/json"
          })
          .build()
      );
    }

    const newTenant = req.params.tenant.value;
    tenants.create(newTenant.id, newTenant.texts.description, newTenant.contacts)
      .then(tenant => {
        addTenantUri(res, tenant.id);
        res.status(201).end();
      });
  },

  /**
   *
   * @param req
   * @param res
   */
  getTenantSettings: (req, res) => {
    debugLog(`call get /tenants/:tenant/settings`);
    const tenant = req.getPrm("tenant", "value");
    if (tenant === null) {
      throw req.getPrm("tenant", "err");
    }
    res.status(200).json(tenant.adminSettings || {});
  },

  /**
   *
   * @param req
   * @param res
   */
  updateTenantSettings: (req, res) => {
    debugLog(`call put /tenants/:tenant/settings`);
    const tenantId = req.getPrm("tenant", "value", "id");
    const settings = req.body;
    tenants.update(tenantId, "adminSettings", settings)
      .then(() => {
        res.status(200).end();
      });
  },
};
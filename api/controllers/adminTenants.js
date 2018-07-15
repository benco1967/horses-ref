'use strict';

const config = require('config');
const tenants = require('../models/tenant');

const links = require('../helpers/linkBuilder');

const logger = require('../../common/helpers/logger');
const errorLog = logger.error(`admin-controller`);

/**
 * Gestion des tenants par le super administrateur
 * Permet de :
 * <li>lister les tenants
 * <li>créer un tenant
 * <li>récupérer les paramètres administrateur du tenant
 * <li>modifier les paramètres administrateur du tenant
 */
module.exports = {
  /**
   * Retourne les tenants de ce service
   * @param req
   * @param res réponse sous forme d'un tableau de tous les tenants
   * @param next
   */
  getAllTenants: (req, res, next) => {
    // TODO la pagination
    tenants.getAll()
      .then(tenants => {
        res.status(200).json(tenants);
      })
      .catch(err => {
        errorLog(`Unable to get all tenants: ${err.message}`);
        next(err);
      });
  },

  /**
   * Crée un tenant pour ce service
   * @param req le json contenant l'id et la description du nouveau tenant
   * @param res 201 : créé, 409: erreur car déjà créé, 500: autre erreur
   * @param next
   */
  createTenant: (req, res, next) => {
    const url = config.get('basePath');
    const addTenantUri = (res, idTenant) => {
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
    };

    const newTenant = req.body;
    tenants.create(newTenant.id, newTenant.texts.description, newTenant.contacts)
      .then(tenant => {
        addTenantUri(res, tenant.id);
        res.status(201).end();
      })
      .catch(err => {
        errorLog(`Unable to create the new tenant: ${err.message}`);
        next(err);
      });
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  getAdminTenantSettings: (req, res, next) => {
    const tenant = req.getPrm('tenant', 'value');
    if (tenant === null) {
      const err = req.getPrm('tenant', 'err');
      errorLog(`Unable to get the tenant settings: ${err.message}`);
      next(err);
    }
    else {
      res.status(200).json(tenant.adminSettings || {});
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  updateAdminTenantSettings: (req, res, next) => {
    const tenantId = req.getPrm('tenant', 'value', 'id');
    const settings = req.body;
    tenants.update(tenantId, 'adminSettings', settings)
      .then(() => {
        res.status(200).end();
      })
      .catch(err => {
        errorLog(`Unable to update the tenant settings: ${err.message}`);
        next(err);
      });
  },
};
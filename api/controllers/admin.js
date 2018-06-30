'use strict';
const express = require('express');
const adminSettings = require('../models/adminSettings');
const tenants = require('../models/tenant');
const codeToResponse = require('../helpers/errorCodes').codeToResponse;
const debug = require('debug')('horses-ref:admin-router');


const router = express.Router();
module.exports = router;

const SecurityHandler  = require('../middlewares/security/securityHandlers');
const basic  = require('../middlewares/security/basicSecurityHandler').Basic(['adm']);
const bearer  = require('../middlewares/security/bearerSecurityHandler').Bearer(['adm']);
const securityHandler = new SecurityHandler(basic, bearer);
router.use('/', securityHandler.middleware());

/**
 * Méthode pour GET /settings
 *
 * Retourne les paramètres généraux
 * @param req request
 * @param res réponse JSON des paramètres
 */
router.get('/settings', (req, res) => {
  debug(`call get /settings`);
  adminSettings.get()
  // suppression des champs inutiles (_v, _id)
    .then(settings =>
      settings.toObject({
        versionKey: false,
        minimize: false,
        transform: (doc, ret) => { delete ret._id; return ret; },
      }))
    .then(settings => {
      debug(settings);
      res.json(settings);
    })
    .catch(err => {
      codeToResponse(res, err);
    });
});

/**
 * Méthode pour PUT /settings
 *
 * Retourne les paramètres généraux
 * @param req request
 * @param res réponse JSON des paramètres
 */
router.put('/settings', (req, res) => {
  debug(`call put /settings`);
  adminSettings.update(req.body)
    .then(settings => {
      res.json(settings);
    })
    .catch(err => {
      codeToResponse(res, err);
    });

});


/**
 * Méthode pour GET /tenants
 *
 * Retourne les tenants de ce service
 * @param req requête
 * @param res réponse sous forme d'un tableau de tous les tenants
 *
 */
router.get('/tenants', (req, res) => {
  debug(`call get /tenants`);
  // TODO la pagination
  tenants.getAll()
    .then(tenants => {
      res.status(200).json(tenants);
    })
    .catch(err => {
      codeToResponse(res, err);
    });
});

/**
 * Méthode pour POST /tenants
 *
 * Crée un tenant pour ce service
 * @param req le json contenant l'id et la description du nouveau tenant
 * @param res 201 : créé, 409: erreur car déjà créé, 500: autre erreur
 */
router.post('/tenants', (req, res) => {
  debug(`call post /tenants`);
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
    })
    .catch(err => {
      codeToResponse(res, err);
    });
});

/**
 *
 * @param req
 * @param res
 */
router.get('/tenants/:tenant/settings', (req, res) => {
  debug(`call get /tenants/:tenant/settings`);
  const tenant = getParam(req, "tenant", "value");
  if(tenant !== null) {
    res.status(200).json(tenant.adminSettings || {});
  }
  else {
    codeToResponse(res, getParam(req, "tenant", "err"));
  }
});

/**
 *
 * @param req
 * @param res
 */
router.put('/tenants/:tenant/settings', (req, res) => {
  debug(`call put /tenants/:tenant/settings`);
  const tenantId = getParam(req, "tenant", "value", "id");
  const settings = req.body;
  tenants.update(tenantId, "adminSettings", settings)
    .then(() => {
      res.status(200).end();
    })
    .catch(err => {
      codeToResponse(res, err);
    });
});
'use strict';
const createError = require('http-errors');
const links = require('../helpers/linkBuilder');
const StatusBuilder = require('../helpers/statusBuilder');
const Version = require("../../common/models/version");
const ROLES = require('../../common/models/groupRoleMapping').ROLES;
const config = require('config');

const logger = require('../../common/helpers/logger');
const errorLog = logger.error(':infos-controller');

module.exports = {
  root: (req, res) => {
    const url = config.get('basePath');

    res.header("link",
      new links()
        .add({
          href: `${url}/status`,
          rel: "status",
          title: "Refers to the service's status",
          name: "status",
          method: "GET",
          type: "application/json"
        })
        .add({
          href: `${url}/license`,
          rel: "license",
          title: "Refers to the service's license",
          name: "license",
          method: "GET",
          type: "plain/text"
        })
        .add({
          href: `${url}/roles`,
          rel: "roles",
          title: "List all available roles",
          name: "roles",
          method: "GET",
          type: "application/json"
        })
        .add({
          href: `${url}/version`,
          rel: "version",
          title: "Refers to the service's version",
          name: "version",
          method: "GET",
          type: "application/json"
        })
        .add({
          href: `${url}/swagger.json`,
          rel: "swagger",
          title: "Refers to the service's swagger definition",
          name: "swagger",
          method: "GET",
          type: "application/json"
        })
        .add({
          href: `${url}/admin/tenants`,
          rel: "tenants",
          title: "List all available tenants",
          name: "tenants",
          method: "GET",
          type: "application/json"
        })
        .build())
      .json({
        title: "Administration endpoint",
        description: "Welcome to the multitenancy administration endpoint, you will find all available tenants"
      });
  },
  /**
   * Retourne la version de ce service
   * @param req request
   * @param res réponse contenant la version du service
   */
  version: (req, res) => {
    //TODO mettre la version et notamment le build_number dynamiquement
    res.json(new Version("horsesRef", "0.1.0"));
  },
  /**
   * Méthode pour /admin/status
   *
   * Retourne le status courant de ce service
   * @param req request
   * @param res réponse json décrivant l'état du service et de ses dépendances
   */
  status: (req, res) => {
    new StatusBuilder("Service horse-ref")
      .addDependencie(require('../helpers/dbStatus'))
      .getStatus()
      .then(status => res.json(status));
  },
  /**
   * Méthode pour /admin/license
   *
   * Retourne la licence de ce service
   * @param req request
   * @param res réponse au format au format Atom XML RFC4946
   * @param next
   */
  license: (req, res, next) => {
    const root = __dirname + '/../..';
    const licenseFilePath = '/config/license.xml';
    res.sendFile(
      licenseFilePath,
      {root},
      err => {
        if (err) {
          errorLog(`error to get the license: ${err}`);
          next(new createError.ServiceUnavailable(err));
        }
      });
  },
  /**
   * Méthode pour /admin/roles
   *
   * Retourne la liste des roles disponibles pour ce service
   * @param req request
   * @param res réponse JSON décrivant les rôles du services
   */
  roles: (req, res) => {
    res.json(ROLES);
  },
};


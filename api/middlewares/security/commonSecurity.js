'use strict';
const debug = require('debug')("notifSender:security");
const errorCodes = require('../../helpers/errorCodes');
const createParam = require('../../helpers/customParams').create;
const getParam = require('../../helpers/customParams').get;

class AdmFn {

  set adminGroupRoleMapping(adminGroupRoleMapping) {
    this._adminGroupRoleMapping = adminGroupRoleMapping;
  }
  handleTenantErr(req, err, next) {
    if (err) {
      next(errorCodes.error(err.code));
      // erreur => bye bye
      return true;
    }
    return false;
  }
  handleSuperAdmin(adminRoles, req, user, next) {
    const groups = user.groups["admin"];
    const isSuperAdmin = groups &&
      groups.find(g => this._adminGroupRoleMapping[g] && this._adminGroupRoleMapping[g].indexOf('adm') !== -1) !== undefined;
    if (isSuperAdmin) {
      // Super admin donne tous les droits
      user.roles = adminRoles;
      createParam(req, "user", user);
      next();
    }
    return isSuperAdmin;
  }
  getGroups(user) {
    return user.groups && user.groups["admin"]  // Pas de tenant ou onlyAdmin => admin
    || [];                                      // fallback
  }
  getRoleMapping(tenant) { return this._adminGroupRoleMapping; }
}

class TenantFn extends AdmFn {
  handleTenantErr(req, err, next) {
    if (err && err.code === errorCodes.NOT_FOUND) {
      error401(req, `Authorization error: "No such tenant"`, next);
      return true; // erreur => bye bye
    }
    return super.handleTenantErr(req, err, next);
  }
  getGroups(user, tenant) {
    return tenant ?
      user.groups && user.groups[tenant && tenant.id] || [] :
      super.getGroups(user);
  }
  getRoleMapping(tenant) {
    return tenant && tenant.groupRoleMapping || super.getRoleMapping(adminGroupRoleMapping);
  }
}


class CommonAuth {
  constructor(fn, allowedRoles) {
    this.fn = fn;
    this.allowedRoles = allowedRoles;
  }
  static error401(errMsg, next) {
    debug(errMsg);
    const err = errorCodes.error(errorCodes.UNAUTHORIZED, errMsg);
    err.headers = {"WWW-Authenticate": `Basic realm="Authentication requise", charset="UTF-8"`};
    next(err);
  }

  static error403(errMsg, next) {
    debug(errMsg);
    next(errorCodes.error(errorCodes.FORBIDDEN, errMsg));
  }
  authentification(req, res, next) {
    this.error403("", next);
  }
  _authentification(req, user) {

    if (this.fn.handleTenantErr(req, getParam(req, "tenant", "err"), next)) return;
    if (this.fn.handleSuperAdmin(req, user, next)) return;

    // Récupération du tenant s'il existe
    const tenant = getParam(req, "tenant", "value");
    // Récupération des groupes dont fait parti l'utilisateur qui se trouve dans le token
    // objet qui pour chaque tenant contient un tableau des groupes auquel l'utilisateur appartient
    // ex: {"test":["marketing"], "autreTenant":["chef"]}
    const groups = this.fn.getGroups(user, tenant);

    // Récupération du groupRoleMapping pour le tenant
    // objet contenant la liste des rôles par groupe
    // ex: { "marketing" : ["snd"], "administrateur" : ["mng", "usr"], "utilisateur": [ "usr"] }
    // Si le tenant est invalide ou que le mapping n'est pas présent on utilise une configuration par défaut
    // Cette dernière est utilisée pour les reqêtes d'administration du service
    const groupRoleMapping = this.fn.getRoleMapping(tenant);

    // Liste des rôles à remplir
    const roles = new Set();
    // Ajout des rôles issu du mapping des groupes
    // ex: pour le tenant "test", on aura le Set(["snd"]) issue du group "marketing"
    groups.forEach(g => groupRoleMapping[g] && groupRoleMapping[g].forEach(r => roles.add(r)));
    user.roles = roles;

    // Vérification que l'un des rôles dont dispose le token est autorisé
    const accessGranted = this.allowedRoles.find(r => roles.has(r));
    if (accessGranted) {
      // ok on ajoute les paramètres extrait (le token et les roles) et on passe la main au contrôleur
      createParam(req, "user", user);
      next();
    }
    else {
      // nok erreur 403
      this.error403(`Access is not granted for [${[...roles]}] (should be in [${allowedRoles}])`, next);
    }
  }
}

module.exports = {
  CommonAuth,
  AdmFn,
  TenantFn
};


const debug = require('debug')("horses-ref:security");
const errorCodes = require('../../helpers/errorCodes');


class AdmFn {

  handleTenantErr(err) {
    if (err) {
      return errorCodes.error(err.code);
    }
    return false;
  }

  handleSuperAdmin(req, adminGroupRoleMapping, user) {
    const groups = user.groups["admin"];
    let isSuperAdmin = groups && groups.reduce((isAdmin, g) =>
      isAdmin || adminGroupRoleMapping[g] && adminGroupRoleMapping[g].indexOf('adm') !== -1, false);
    if (isSuperAdmin) {
      // Super admin donne tous les droits
      user.roles = ['adm', 'mng', 'snd', 'usr'];
      req.setCustomParam('user', user);
    }
    return isSuperAdmin;
  }

  getGroups(user) {
    return user.groups && user.groups["admin"]  // Pas de tenant ou onlyAdmin => admin
      || [];                                    // fallback
  }

  getRoleMapping(tenant, adminGroupRoleMapping) {
    return adminGroupRoleMapping;
  }
}

class TenantFn extends AdmFn {
  handleTenantErr(err) {
    // Transforme une erreur 404 en 401 pour éviter l'espionnage de contenu
    // en parcourant tous les nomns de tenant possibles on aura toujours une réponse 401 que le tenant existe ou pas
    // de fait, on ne pourra pas déduire lesquels existent et lesquels n'existent pas
    if (err && err.code === errorCodes.NOT_FOUND) {
      return SecurityHandler.error401(`Authorization error: "No authorization available")`);
    }
    return super.handleTenantErr(err);
  }
  getGroups(user, tenant) {
    return tenant ?
      user.groups && user.groups[tenant && tenant.id] || [] :
      super.getGroups(user)
  }
  getRoleMapping(tenant, adminGroupRoleMapping) {
    return tenant ?
      tenant.groupRoleMapping :
      adminGroupRoleMapping;
  }
}

/**
 * Classe abstraite de base d'un handler de sécurité. Pour que ce mécanisme puisse fonctionner avec un multi-tenant, il
 * faut que le tenant ait été extrait au préalable par le middleware TenantLoader
 */
class SecurityHandler {
  /**
   *
   * @param name le nom d'identification utilisé dans les traces
   * @param fn le jeu de fonctions (AdmFn ou TenantFn) permettant de récupérer les paramètres de l'authentification
   * @param allowedRoles roles autorisés
   * @param parameters optionnels permettant de redéfinir les paramètres de la configuration (utilisé pour le test)
   */
  constructor(name, fn, allowedRoles, parameters) {
    this.name = name;
    this.fn = fn;
    this.allowedRoles = allowedRoles;
    this.parameters = parameters;
  }

  /**
   * Crée une erreur 401 avec le message donné
   * @param errMsg message d'erreur
   * @returns {*} un objet Error
   */
  static error401(errMsg) {
    return errorCodes.error(errorCodes.UNAUTHORIZED, errMsg);
  }

  /**
   * Crée une erreur 403 avec le message donné
   * @param errMsg message d'erreur
   * @returns {*} un objet Error
   */
  static error403(errMsg) {
    return errorCodes.error(errorCodes.FORBIDDEN, errMsg);
  }

  /**
   * Méthode principale retournant si la requête est authentifiée et autorisée
   * @param req requête à traiter
   * @returns {boolean|Error} l'erreur, false si l'authentification est ok, sinon retourne un object Error
   */
  handle(req) {
    return SecurityHandler.error401('No authorization protocols defined');
  }

  /**
   * Méthode utilitaire
   * @param req requête à traiter contenant les paramètres d'authentification
   * @param adminGroupRoleMapping liste des groupes roles mapping pour l'admin
   * @param user l'uilisateur extrait des paramètres de la requête
   * @returns {*} soit false s'il n'y a pas d'erreur et que l'accès est autorisé, soit l'objet Error contenant l'erreur
   * @protected
   */
  $authentification(req, adminGroupRoleMapping, user) {
    const tenantErr = this.fn.handleTenantErr(req.getCustomParam('tenant', 'err'));
    if (tenantErr) return tenantErr;
    if (this.fn.handleSuperAdmin(req, adminGroupRoleMapping, user)) {
      debug(`${this.name} allows user "${user.userId}" with roles [${user.roles}]`);
      return false;
    }

    // Récupération du tenant
    const tenant = req.getCustomParam('tenant', 'value');
    const tenantMsg = tenant && ` for tenant "${tenant.id}"` || '';
    // Récupération des groupes dont fait parti l'utilisateur qui se trouve dans le token
    // objet qui pour chaque tenant contient un tableau des groupes auquel l'utilisateur appartient
    // ex: {"test":["marketing"], "autreTenant":["chef"]}
    const groups = this.fn.getGroups(user, tenant);

    // Récupération du groupRoleMapping pour le tenant
    // objet contenant la liste des rôles par groupe
    // ex: { "marketing" : ["snd"], "administrateur" : ["mng", "usr"], "utilisateur": [ "usr"] }
    // Si le tenant est invalide ou que le mapping n'est pas présent on utilise une configuration par défaut
    // Cette dernière est utilisée pour les reqêtes d'administration du service
    const groupRoleMapping = this.fn.getRoleMapping(tenant, adminGroupRoleMapping);

    // Liste des rôles à remplir
    const roles = new Set();
    // Ajout des rôles issu du mapping des groupes
    // ex: pour le tenant "test", on aura le Set(["snd"]) issue du group "marketing"
    groups.forEach(g => groupRoleMapping[g] && groupRoleMapping[g].forEach(r => roles.add(r)));
    user.roles = [...roles];
    const rolesMsg = `with roles [${user.roles}]`;

    // Récupération des rôles autorisés pour l'opération en cours
    const allowedRoles = this.allowedRoles || [];

    // Vérification que l'un des rôles dont dispose le token est autorisé
    const accessGranted = allowedRoles.reduce((accessGranted, r) => accessGranted || roles.has(r), false);
    if (accessGranted) {
      // ok on ajoute les paramètres extrait (le token et les roles) et on passe la main au contrôleur
      req.setCustomParam('user', user);
      debug(`${this.name} allows user "${user.userId}"${tenantMsg} ${rolesMsg}`);
      return false;
    }
    else {
      // nok erreur 403
      return SecurityHandler.error403(
        `${this.name} denies access for user "${user.userId}"${tenantMsg} ${rolesMsg} (should be in [${allowedRoles}])`
      );
    }
  }
}

module.exports = {
  AdmFn, TenantFn, SecurityHandler
};

'use strict';
const basicAuth = require('basic-auth');
const config = require('config');
const CommonAuth = require('./commonSecurity').CommonAuth;
const TenantFn = require('./commonSecurity').TenantFn;
const AdmFn = require('./commonSecurity').AdmFn;

const defaultParameters = {
  basic: {
    users: config.has('auth.basic.users') && config.get('auth.basic.users') || [],
    /**
     * fonction de test des mots de passse.
     * Il est possible de modifier cette méthode si on souhaite encoder le mot de passe ou le contrôle
     * @param password fourni par l'utilisateur
     * @param control fourni par les crédentials
     * @returns {boolean} true si le mot de passe correspond au contrôle
     */
    checkPassword: (password, control) => password === control,
  },
  adminGroupRoleMapping: config.has('auth.adminGroupRoleMapping') && config.get('auth.adminGroupRoleMapping') || {},
};

/**
 * @param parameters définissant le secret et les options de décodage du JWT
 * @param fn object contenant les fonctions
 * @returns {function(*=, *, *=, *=)} le handler pour la sécurité
 */
class BasicSecurityHandler extends CommonAuth {
  constructor(parameters, Fn) {
    super(new Fn(parameters && parameters.adminGroupRoleMapping || defaultParameters.adminGroupRoleMapping));
    this.parameters = Object.assign({},
      defaultParameters.basic,
      parameters && parameters.basic);
  }

  /**
   * Handler de l'authentification par username/password. Génère une erreur si les données transmises sont invalides.
   * Sinon les informations (user, roles,...) sont disponibles dans la configuration ensuite la main est passée au
   * controller qui doit vérifier que l'utilisateur à bien les droits nécessaires.
   * @param req requête
   * @param res réponse (ignorée)
   * @param next à appeler si une erreur <pre>Error("texte de l'erreur") est passé en paramètre le process s'arrête et
   * générère une erreur. On peut ajouter à l'erreur un statusCode (401, 403,...) et un code (texte d'identification de
   * l'erreur)
   */
  authentification(req, res, next) {
    try {
      const credential = basicAuth(req);
      const user = credential && this.parameters.users.find(u =>
        u.username === credential.name && this.parameters.basic.checkPassword(u.password, credential.pass)
      );
      if (user) {
        this._authentification(req, next, user);
      }
      else {
        this.error401(`Authorization error: "invalid name / password"`, next);
      }
    }
    catch (err) {
      this.error401(`Authorization error: "invalid basic authentication"`, next);
    }
  }
}


/**
 * Handler pour le securityDefinitions Bearer
 * Si d'autres modèles de sécurités sont créés il faut les ajouter ici
 */
module.exports = {
  basic: parameters => new BasicSecurityHandler(parameters, TenantFn),
  basicAdm: parameters => new BasicSecurityHandler(parameters, AdmFn),
};


const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('config');
const SecurityHandler = require('./commonSecurity').SecurityHandler;
const TenantFn = require('./commonSecurity').TenantFn;
const AdmFn = require('./commonSecurity').AdmFn;

/*
Initialisation de l'authentification, récupération des paramètres de la configuration
Retourne une promesse car les données comme le secret peuvent être accédés dans un fichier ou via un serveur
 */
const initAuthentication = () => {
  if(config.has('auth.bearer.secret')) {
    return Promise.resolve(config.get('auth.bearer.secret'));
  }
  if(config.has('auth.secretPath')) {
    return new Promise((resolve, reject) => {
      fs.readFile(config.get('auth.bearer.secretPath'), (err, data) => {
        if(err) {
          reject(Error('Unable to read the jwt secret file'))
        }
        else {
          resolve(data);
        }
      });
    });
  }
  if(config.has('auth.bearer.secretUrl')) {
    return Promise.reject(Error('Not implemented yet'));
  }
  return Promise.reject(Error('No authentication key provided'));
};

// Paramètres de configuration initalement vide se remplit lorsque la promesse d'initialisation est remplie
const defaultParameters = {
  bearer: {
    // mapping utilisé lorsqu'il n'y a pas de tenant i.e. l'administration du service
    adminGroupRoleMapping: config.has('auth.adminGroupRoleMapping') ? config.get('auth.adminGroupRoleMapping') : {},
  }
};

// Récupération des paramètres de config
initAuthentication().then((secret) => {
  // Secret de décodage du jwt
  defaultParameters.bearer.sharedSecret = secret;

  // Options de décodage du jwt
  defaultParameters.bearer.options = {};
  if (config.has('auth.bearer.issuer') && config.get('auth.bearer.issuer')) defaultParameters.bearer.options.issuer = config.get('auth.bearer.issuer');
  if (config.has('auth.bearer.audience') && config.get('auth.bearer.audience')) defaultParameters.bearer.options.audience = config.get('auth.bearer.audience');
});

/**
 * @param parameters définissant le secret et les options de décodage du JWT
 * @param fn object contenant les fonctions
 * @returns {function(*=, *, *=, *=)} le handler pour la sécurité
 */
class BearerSecurityHandler extends SecurityHandler {

  /**
   * Handler de l'authentification par JWT. Génère une erreur si aucun token ou un token invalide est transmit. Sinon les
   * informations (user, roles,...) du token sont disponibles dans le champ req.authenticationToken, ensuite la main est
   * passée au controller qui doit vérifier que l'utilisateur à bien les droits nécessaires.
   * @param req requête
   * @param authOrSecDef définition swagger du type d'authentification
   * @param authorizationHeader la clé fournie
   * @param callback à appeler si une erreur <pre>Error("texte de l'erreur") est passé en paramètre le process s'arrête et
   * générère une erreur. On peut ajouter à l'erreur un statusCode (401, 403,...) et un code (texte d'identification de
   * l'erreur)
   */
  handle(req) {
    const usedParameters = {
      adminGroupRoleMapping: this.parameters && this.parameters.bearer &&
        this.parameters.bearer.adminGroupRoleMapping || defaultParameters.bearer.adminGroupRoleMapping,
      bearer: Object.assign({}, defaultParameters.bearer, this.parameters && this.parameters.bearer)
    };

    const authorizationHeader = req.get('Authorization');
    return new Promise((resolve) => {
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        resolve(SecurityHandler.error401(`Authorization error: "wrong Authorization protocol"`));
      }
      else {
        jwt.verify(authorizationHeader.split(' ')[1], usedParameters.bearer.sharedSecret, usedParameters.bearer.options, (err, token) => {
          if (err) {
            resolve(SecurityHandler.error401(`${err.name}: "${err.message}"`));
          }
          else {
            resolve(this.$authentification(req, usedParameters.adminGroupRoleMapping, {authorization: authorizationHeader, userId: token.Usr, groups: token.Grp}));
          }
        });
      }
    });
  }
}



/**
 * Handler pour le securityDefinitions Bearer
 */
module.exports = {
  Bearer: (allowedRoles, parameters) => new BearerSecurityHandler('Bearer for Tenant', new TenantFn(), allowedRoles, parameters),
  BearerAdm: (allowedRoles, parameters) => new BearerSecurityHandler('Bearer for Admin', new AdmFn(), allowedRoles, parameters),
};

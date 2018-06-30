'use strict';
const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('config');
const CommonAuth = require('./commonSecurity').CommonAuth;
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
    options : {
      issuer: config.has('auth.bearer.issuer')  && config.get('auth.bearer.issuer') || undefined,
      audience:  config.has('auth.bearer.audience')  && config.get('auth.bearer.audience') || undefined,
    }
  },
  // mapping utilisé lorsqu'il n'y a pas de tenant i.e. l'administration du service
  adminGroupRoleMapping: config.has('auth.adminGroupRoleMapping') && config.get('auth.adminGroupRoleMapping') || {},
};

// Récupération des paramètres de config
initAuthentication().then((secret) => {
  // Secret de décodage du jwt
  defaultParameters.bearer.sharedSecret = secret;
});

/**
 * @param parameters définissant le secret et les options de décodage du JWT
 * @param fn object contenant les fonctions
 * @returns {function(*=, *, *=, *=)} le handler pour la sécurité
 */
class BearerSecurityHandler extends CommonAuth {
  constructor(parameters, Fn) {
    super(new Fn(parameters && parameters.adminGroupRoleMapping || defaultParameters.adminGroupRoleMapping));
    this.parameters = {
      bearer: Object.assign({}, defaultParameters.bearer, parameters && parameters.bearer)
    };
  }

  /**
   * Handler de l'authentification par JWT. Génère une erreur si aucun token ou un token invalide est transmit. Sinon les
   * informations (user, roles,...) du token sont disponibles dans le champ req.authenticationToken, ensuite la main est
   * passée au controller qui doit vérifier que l'utilisateur à bien les droits nécessaires.
   * @param req requête
   * @param res réponse (ignorée sauf en cas d'erreur)
   * @param next à appeler si une erreur <pre>Error("texte de l'erreur") est passé en paramètre le process s'arrête et
   * générère une erreur. On peut ajouter à l'erreur un statusCode (401, 403,...) et un code (texte d'identification de
   * l'erreur)
   */
  authentification(req, res, next) {
    const authorizationHeader = req.header("authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      this.error401(req, `Authorization error: "wrong Authorization protocol"`, next);
    }
    else {
      jwt.verify(authorizationHeader.split(' ')[1], this.parameters.bearer.sharedSecret, this.parameters.bearer.options, (err, token) => {
        if (err) {
          this.error401(`${err.name}: "${err.message}"`, next);
        }
        else {
          super._authentification(req, next, {userId: token.Usr, groups: token.Grp});
        }
      });
    }
  }
}

/**
 * Handler pour le securityDefinitions Bearer
 */
module.exports = {
  bearer: parameters => new BearerSecurityHandler(parameters, TenantFn),
  bearerAdm: parameters => new BearerSecurityHandler(parameters, AdmFn),
};

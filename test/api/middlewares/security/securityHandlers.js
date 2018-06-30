const codeToResponse = require('../../helpers/errorCodes').codeToResponse;
const debug = require('debug')("horses-ref:security");

class SecurityHandler {
  /**
   * @param handlers liste des handlers gérant l'authentification, chaque handler étend la classe SecurityHandler.
   */
  constructor(...handlers) {
    this.handlers = handlers;
  }

  /**
   * Retourne la fonction de middleware celle-ci demande à chaque handler si l'autorisation est accordée ou non
   * @returns {Function} la fonction de middleware utilisable par express
   */
  middleware() {
    return (req, res, next) => {
      Promise
        // récupère toutes les promesses
        .all(this.handlers.map(h => h.handle(req)))
        // trouve la première autorisation qui passe ou le message d'erreur avec le code le plus élevé 403 > 401
        .then(r => r.reduce((a, r) => a === false ? false : (a.statusCode > r.statusCode ? a : r), true))
        // gestion de la réponse finale
        .then(err => {
          if (err === false) {
            // si err=== false c'est que l'un des handlers a répondu positivement à la demande d'accès
            next();
          }
          else {
            // sinon c'est qu'il a refus d'accès et on retourne une erreur d'authentification 401 ou 403 selon le cas
            debug(`not allowed ${err}`);
            codeToResponse(res, err);
          }
        });
      }
    }
}

module.exports = SecurityHandler;

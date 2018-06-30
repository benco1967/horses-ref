/**
 * Ce middleware de param extrait le tenant à partir du paramètre indiqué ":tenantId" indiqué dans la route.
 * voir READ.md
 */

const error = require('debug')("horses-ref:error");
const tenants = require('../models/tenant');
/**
 * @returns {Function}
 */
module.exports = function(req, res, next, tenantId) {
  tenants.get(tenantId)
    .then(tenant => {
      req.setCustomParam('tenant', { value: tenant, err: null });
      next();
    })
    .catch(err => {
      error(`unknow tenant "${tenantId}"`);
      req.setCustomParam('tenant', { value: null, err });
      // Aucune erreur n'est levée car sinon le security handler est shunté et savoir qu'un tenant
      // n'existe pas est une information stratégique qu'il ne faut pas afficher si on n'a pas les
      // droits suffisants. On laisse le contrôleur faire le check de la validité du tenant
      next();
    });
};

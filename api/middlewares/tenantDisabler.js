/**
 * Ce middleware extrait le tenant à partir du paramètre personnalisé et le désactive si la date d'expiration est
 * atteinte.
 * voir READ.md
 */
const createError = require('http-errors');

module.exports = (shouldDisable, unauthorized) => (req, res, next) => {
  const tenant = req.getPrm('tenant', 'value');
  if (tenant === null) {
    // Pas de tenant on lève l'erreur
    const err = req.getPrm('tenant', 'err');
    next(new createError[unauthorized ? 'Unauthorized' : 'NotFound'](err.message));
    return;
  }

  // Test de la date d'expiration et désactivation si nécessaire
  if (tenant.enable === true && tenant.expireAt && tenant.expireAt < Date.now()) {
    tenant.enable = false;
    tenant.save();
  }
  // mise à jour de la date d'expiration si désactivé
  if (tenant.enable === false && (!tenant.expireAt || tenant.expireAt > Date.now())) {
    tenant.expiredAt = Date.now();
    tenant.save();
  }

  // si le tenant est désactivé
  if (shouldDisable && tenant.enable === false) {
    req.deletePrm('tenant');
    next(new createError.Gone());
  }
  else {
    next();
  }
};

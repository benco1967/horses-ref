/**
 * Middleware ajoutant la possibilité d'ajouter des paramètres custom sans conflit sur la requête.
 */
module.exports = function(req, res, next) {
  const s = Symbol('reqCustoms');
  req[s] = {};

  /**
   * Ajout d'un paramètre
   * @param name le nom de la clé dans laquelle sera créée le paramètre
   * @param value valeur du paramètre
   * @returns {*} la valeur du paramètre
   */
  req.setCustomParam = function(name, value) {
    this[s][name] = value;
    return value;
  };
  /**
   * @param names le path du paramètre à récupérer (le premier correspond à l'objet, les suivants à la hiérarchie au
   * sein de l'objet paramètre)
   * @returns {*|null} la valeur du paramètre ou null s'il n'existe pas
   */
  req.getCustomParam = function(...names) {
    let custom = this[s][names[0]] || null;
    for(let i = 1; i < names.length; i++) {
      custom = custom && custom[names[i]] || null;
    }
    return custom;
  };
  /**
   * Suppression d'un paramètre
   * @param name le nom de la clé qui doit être supprimée
   * @returns {*} valeur du paramèrrte supprimé
   */
  req.deleteCustomParam = function(name) {
    const value = this[s][name] || null;
    value && delete this[s][name];
    return value;
  };
  /**
   * Test si un paramètre existe
   * @param name le nom de la clé qui doit être trouvée
   * @returns {boolean} true si le paramètre existe
   */
  req.hasCustomParam = function(name) {
    return !!this[s][name];
  };
  next && next();
};
/**
 * Méthode additionnelle à should pour une propriété avec un libellé insensible à la
 * casse. Utilisée pour tester la présence de champs dans un headers de requête http.
 * En effet la norme des entêtes est case insensitive.
 * Utilisation pour tester la présence de 'Link' dans l'entête :
 * - Au lieu de
     res.header.should.have.property('link').match(REGEX_LINK);
 * - on utilisera
     propertyCI(res.header.should.have, 'Link').match(REGEX_LINK);
 */

module.exports = (assertion, name) => {
  name = name.toLowerCase();
  let obj = assertion.obj;
  for(let p in obj) {
    if(obj.hasOwnProperty(p) && name === p.toLowerCase()) {
      assertion.obj = obj[p];
      return assertion;
    }
  }

  assertion.assert(false);
  return assertion;
};
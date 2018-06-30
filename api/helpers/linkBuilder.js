'use strict';
/* concatène les liens
 */
const _add = (self, hrefXorLink, rel, title, name, method, type) => {
  if(self.links !== '') self.links += ', ';
  self.links += `<${hrefXorLink}>; rel="${rel}"; method="${method}";`;
  if(title) self.links += ` title="${title}";`;
  if(name) self.links += ` name="${name}";`;
  self.links += ` type="${type}"`;
};
/**
 * Implémentation partielle de la rfc5988 (http://www.rfc-editor.org/rfc/rfc5988.txt)
 */
module.exports = class {
  constructor() {
    this.links = '';
  }

  /**
   *
   * @param hrefXorLink le href (url) ou un objet link contenant la liste des paramètres (href, rel, title, name, method
   * et type)
   * @param rel type de relation
   * @param title
   * @param name
   * @param method
   * @param type
   * @returns {exports}
   */
  add(hrefXorLink, rel, title, name, method = "GET", type = "application/json") {
    if(typeof hrefXorLink === 'string') {
      _add(this, hrefXorLink, rel, title, name, method, type);
    }
    else {
      _add(this, hrefXorLink.href, hrefXorLink.rel, hrefXorLink.title, hrefXorLink.name, hrefXorLink.method, hrefXorLink.type);
    }
    return this;
  }
  build() {
    return this.links;
  }
};
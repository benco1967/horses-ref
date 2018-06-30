
/**
 *
 * @param tenantId
 * @param description
 * @param contacts
 * @returns {{id: *, texts: {description: *}, createdAt: Date, updatedAt: Date, expiredAt, enable: boolean, lang: (*|string|string|locale), contacts: *, groupRoleMapping: {}, authentication: Array, settings: {}, adminSettings: {}}}
 */
module.exports = class Tenant {
  constructor(tenantId, description, contacts) {
    this.id = tenantId;
    this.texts = {description};
    this.enable = true;
    this.lang = description && description[0] && description[0].locale || 'fr';
    this.contacts = contacts;
    this.groupRoleMapping = {};
    this.authentication = [];
    this.settings = {};
    this.adminSettings = {};
  }
};
const LocaleText = require('./localeText');

const add = (type, localeText, text) => {
  if(localeText.constructor === LocaleText.constructor) {
    type.push(localeText);
  }
  else if(typeof localeText === 'string' && typeof text === 'string') {
    type.push(new LocaleText(localeText, text));
  }
  else {
    throw Error("invalid parameters");
  }
};

module.exports = class Role {
  constructor(id, label) {
    this.id = id;
    this.label = label;
    this.title = [];
    this.summary = [];
  }
  addTitle(localeText, text) {
    add(this.title, localeText, text);
    return this;
  }
  addSummary(localeText, text) {
    add(this.summary,localeText, text);
    return this;
  }
};
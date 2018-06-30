module.exports = class Status {

  constructor(description) {
    this.description = description;
    this.dependencies = [];
    this.status = 'undefined';
  };
};

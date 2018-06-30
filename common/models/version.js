module.exports = class Version {

  constructor(name, number, build, type) {
    this.name = name;
    this.version = {
      number: number || "0.0.0",
      build: build || "0",
      type: type || "debug"
    };
  };
};
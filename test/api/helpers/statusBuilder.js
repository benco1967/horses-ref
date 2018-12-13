
const utilsAndConst = require('../helpers/utilsAndConst');
const REGEX_STATUS = utilsAndConst.STATUS;

const StatusBuilder = require('../../../api/helpers/statusBuilder');

const checkStatus = async (builder, statusShouldBe, empty) => {
  status = await builder.getStatus();
  status.should.have.match({
    status: statusShouldBe,
    description: '',
    dependencies: d =>
      d.should
        .be.instanceof(Array)
        .and
        .matchEach({
          id: id => id.should.be.a.String,
          description: descr => descr.should.be.a.String,
          status: REGEX_STATUS,
        })
  });
};

const createDependencieFn = (status) => () => Promise.resolve({
  id: 'id of the dependencie',
  description: 'description',
  status: status
});

describe('class StatusBuilder', () => {


  describe('Test with constructor', () => {
    it('Build a new empty Status', () => {
      const builder = new StatusBuilder('');
      return checkStatus(builder, 'ok',  true);
    });

  });

  describe('Test with optionnal dependencies', () => {
    it('Build a new Status with an optional dependencie ok', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("ok"));
      return checkStatus(builder, 'ok');
    });

    it('Build a new Status with an optional dependencie in warning', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("warning"));
      return checkStatus(builder, 'warning');
    });

    it('Build a new Status with an optional dependencie in error', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"));
      return checkStatus(builder, 'warning');
    });

    it('Build a new Status with an optional dependencie unknow', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("unknow"));
      return checkStatus(builder, 'warning');
    });

    it('Build a new Status with two optional dependencies one in error, one ok ', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"))
        .addDependencie(createDependencieFn("ok"));
      return checkStatus(builder, 'warning');
    });

  });

  describe('Test with mandatory dependencies', () => {
    it('Build a new Status with an mandatory dependencie ok', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("ok"), true);
      return checkStatus(builder, 'ok');
    });

    it('Build a new Status with an mandatory dependencie in warning', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("warning"), true);
      return checkStatus(builder, 'warning');
    });

    it('Build a new Status with an mandatory dependencie in error', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"), true);
      return checkStatus(builder, 'error');
    });

    it('Build a new Status with an mandatory dependencie unknow', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("unknow"), true);
      return checkStatus(builder, 'error');
    });

    it('Build a new Status with two mandatory dependencies one in error, one ok ', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"), true)
        .addDependencie(createDependencieFn("ok"), true);
      return checkStatus(builder, 'error');
    });

  });
  describe('Test with mixing dependencies', () => {
    it('Build a new Status with two mandatory dependencies in error', () => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"))
        .addDependencie(createDependencieFn("error"), true);
      return checkStatus(builder, 'error');
    });

  });
  describe('dependencie function with errors', () => {
    it("Build a new Status with a dependencie that is not a function", () => {
      const builder = new StatusBuilder('')
        .addDependencie('wrong');
      return checkStatus(builder, 'warning',  true);
    });

    it("Build a new Status with a dependencie that doesn't return a promise", () => {
      const builder = new StatusBuilder('')
        .addDependencie(() => 'wrong');
      return checkStatus(builder, 'warning',  true);
    });

    it('Build a new Status with a dependencie that throw error', () => {
      const builder = new StatusBuilder('')
        .addDependencie(() => { throw 'error' });
      return checkStatus(builder, 'warning',  true);
    });

    it('Build a new Status with a dependencie that is in error', () => {
      const builder = new StatusBuilder('')
        .addDependencie(() => Promise.reject('error'));
      return checkStatus(builder, 'warning',  true);
    });

  });

});

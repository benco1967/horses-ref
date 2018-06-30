
const utilsAndConst = require('../helpers/utilsAndConst');
const REGEX_STATUS = utilsAndConst.STATUS;

const StatusBuilder = require('../../../api/helpers/statusBuilder');

const checkStatus = (builder, done, statusShouldBe) => {
  builder.getStatus()
    .then(status => {
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
      done();
    });
};

const createDependencieFn = (status) => () => Promise.resolve({
  id: 'id of the dependencie',
  description: 'description',
  status: status
});

describe('class StatusBuilder', () => {


  describe('Test with constructor', () => {
    it('Build a new empty Status', done => {
      const builder = new StatusBuilder('');
      checkStatus(builder, done, 'ok');
    });

  });

  describe('Test with optionnal dependencies', () => {
    it('Build a new Status with an optional dependencie ok', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("ok"));
      checkStatus(builder, done, 'ok');
    });

    it('Build a new Status with an optional dependencie in warning', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("warning"));
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with an optional dependencie in error', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"));
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with an optional dependencie unknow', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("unknow"));
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with two optional dependencies one in error, one ok ', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"))
        .addDependencie(createDependencieFn("ok"));
      checkStatus(builder, done, 'warning');
    });

  });

  describe('Test with mandatory dependencies', () => {
    it('Build a new Status with an mandatory dependencie ok', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("ok"), true);
      checkStatus(builder, done, 'ok');
    });

    it('Build a new Status with an mandatory dependencie in warning', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("warning"), true);
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with an mandatory dependencie in error', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"), true);
      checkStatus(builder, done, 'error');
    });

    it('Build a new Status with an mandatory dependencie unknow', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("unknow"), true);
      checkStatus(builder, done, 'error');
    });

    it('Build a new Status with two mandatory dependencies one in error, one ok ', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"), true)
        .addDependencie(createDependencieFn("ok"), true);
      checkStatus(builder, done, 'error');
    });

  });
  describe('Test with mixing dependencies', () => {
    it('Build a new Status with two mandatory dependencies in error', done => {
      const builder = new StatusBuilder('')
        .addDependencie(createDependencieFn("error"))
        .addDependencie(createDependencieFn("error"), true);
      checkStatus(builder, done, 'error');
    });

  });
  describe('dependencie function with errors', () => {
    it("Build a new Status with a dependencie that is not a function", done => {
      const builder = new StatusBuilder('')
        .addDependencie('wrong');
      checkStatus(builder, done, 'warning');
    });

    it("Build a new Status with a dependencie that doesn't return a promise", done => {
      const builder = new StatusBuilder('')
        .addDependencie(() => 'wrong');
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with a dependencie that throw error', done => {
      const builder = new StatusBuilder('')
        .addDependencie(() => { throw 'error' });
      checkStatus(builder, done, 'warning');
    });

    it('Build a new Status with a dependencie that is in error', done => {
      const builder = new StatusBuilder('')
        .addDependencie(() => Promise.reject('error'));
      checkStatus(builder, done, 'warning');
    });

  });

});

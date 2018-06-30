const should = require('should');
const jwt = require('jsonwebtoken');
const getParam = require('../../../../api/helpers/customParams').get;

const parametersBearer1 = {
  bearer: {
    sharedSecret: "secret",
    options: {
      issuer: "test",
      audience: /test/
    }
  },
  basic: {

  },
  adminGroupRoleMapping: { admin: ["adm"] },
};
const bearerSecurityHandler = require('../../../../api/middlewares/security/bearerSecurityHandler').bearer(parametersBearer1);

const parametersBearer2 = {
  bearer: {
    sharedSecret: "secret",
    options: {}
  },
  adminGroupRoleMapping: { admin: ["adm"] },
};
const bearerSecurityHandlerNull = require('../../../../api/middlewares/security/bearerSecurityHandler').bearer(parametersBearer2);

const parametersBasic = {
  basic: {
  },
  adminGroupRoleMapping: { admin: ["adm"] },
};const basicSecurityHandlerNull = require('../../../../api/middlewares/security/basicSecurityHandler').basic(parametersBasic);

const defaultPayload = {
  iss: "test",
  aud: "test and other value",
  sub: "test@example.com",
  Usr: "admin",
  Grp: { admin: [ "admin" ], test: ["admin"] },
};

const createToken = (payload, parameters) => {
  return "Bearer " + jwt.sign(payload, parameters.bearer.sharedSecret);
};
const res = { header: () => {} };
const next = () => {};

describe('Bearer Security Handler', () => {

  describe('Direct test with function without check of issuer and audience', () => {

    it('Valid token without check of issuer and audience', done => {
      const req = {header: { authorization: createToken(Object.assign({}, defaultPayload)) } };
      bearerSecurityHandlerNull.authentification(req, res, (err) => {
        should.not.exist(err);
        getParam(req, "user").should.have.match({ userId: defaultPayload.Usr, groups: defaultPayload.Grp });
        done();
      });
    });

    it('Invalid token', done => {
      bearerSecurityHandlerNull.authentification(defaultReq, null, "Not a Bearer token", (err) => {
        should.exist(err);
        err.should.have.match({statusCode: 401, message: /wrong Authorization protocol/});
        done();
      });
    });

  });

  describe('Direct test with function with issuer and audience', () => {

    it('Valid token', done => {
      const req = defaultReq;
      bearerSecurityHandler.authentification(req, null, createToken(Object.assign({}, defaultPayload), parametersBearer1), (err) => {
        should.not.exist(err);
        getParam(req, "user").should.have.match({ userId: defaultPayload.Usr, groups: defaultPayload.Grp });
        done();
      });
    });

    it('Valid token with wrong issuer', done => {
      bearerSecurityHandler.authentification(defaultReq, null, createToken(Object.assign({}, defaultPayload, { iss: "wrongIssuer" }), parametersBearer1), (err) => {
        should.exist(err);
        err.should.have.match({statusCode: 401, message: /jwt issuer invalid/});
        done();
      });
    });

    it('Valid token with wrong aud', done => {
      bearerSecurityHandler.authentification(defaultReq, null, createToken(Object.assign({}, defaultPayload, { aud: "not the good one" }), parametersBearer1), (err) => {
        should.exist(err);
        err.should.have.match({statusCode: 401, message: /jwt audience invalid/});
        done();
      });
    });

  });

});

describe('Basic Security Handler', () => {

  describe('Direct test with function', () => {

    it('Valid authentification', done => {
      const req = Object.assign({}, defaultReq, { headers:{ authorization: "Basic YWRtaW46YWRtaW4=" } });
      basicSecurityHandlerNull.authentification(req, null, null, (err) => {
        should.not.exist(err);
        getParam(req, "user").should.have.match({
          userId: "admin",
          groups: { admin: [ "admin" ] },
          roles: [ 'adm', 'mng', 'snd', 'usr' ]
        });
        done();
      });
    });

    it('valid authentification but wrong user', done => {
      const req = Object.assign({}, defaultReq, { headers:{ authorization: "Basic d2hhdGV2ZXI6d2hhdGV2ZXI=" } });// no authentication
      basicSecurityHandlerNull.authentification(req, null, null, (err) => {
        should.exist(err);
        err.should.have.match({statusCode: 401, message: /invalid name \/ password/});
        done();
      });
    });
    it('Invalid authentification', done => {
      basicSecurityHandlerNull.authentification(defaultReq, null, null, (err) => {
        should.exist(err);
        err.should.have.match({statusCode: 401, message: /invalid basic authentication/});
        done();
      });
    });

  });

});

const should = require('should');
const request = require('supertest');

const propertyCI = require('../helpers/shouldPropertyCI');
const utilsAndConst = require('../helpers/utilsAndConst');
const REGEX_LINK = utilsAndConst.LINK;

const createTestTenant = require('../helpers/dbTest').createTestTenant;
const createDisabledTestTenant = require('../helpers/dbTest').createDisbaledTestTenant;

const server = require('../../../app');

const DUMMY_SETTINGS = {
  test: 'test',
  anything: { i: "want!" }
};

require('../helpers/security/generateAuthorization')().then(authorization => {
  describe.skip('controllers admin tenants', () => {

    describe('admin/tenants', () => {

      describe('GET /admin/tenants', () => {

        it('should return tenants list', done => {

          request(server)
            .get('/admin/tenants')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should
                .be.instanceof(Array)
                .and
                .matchEach({
                  id: id => id.should.be.a.String,
                  texts: texts => texts.should.be.an.Object,
                  lang: l => l.should.be.a.String,
                });
              done();
            });
        });

        it('should fail if no Authorization', done => {

          request(server)
            .get('/admin/tenants')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });
      });

      describe('POST /admin/tenants', () => {

        it('should return new tenant link', done => {

          request(server)
            .post('/admin/tenants')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(
              {
                id: 'test',
                texts: {description: [{locale: 'fr', text: 'tenant de test'}]},
                contacts: ["test@example.com"]
              }
            )
            .expect(201)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should
                .be.empty();
              propertyCI(res.header.should.have, 'Link').match(REGEX_LINK);
              done();
            });
        });

        it('should fail if no Authorization', done => {

          request(server)
            .post('/admin/tenants')
            .set('Accept', 'application/json')
            .send(
              {
                id: 'test',
                texts: {description: [{locale: 'fr', text: 'tenant de test'}]},
                contacts: ["test@example.com"]
              }
            )
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });

        it('should return error for duplicated tenant', done => {

          createTestTenant()
            .then(() => {
              request(server)
                .post('/admin/tenants')
                .set('Accept', 'application/json')
                .set('Authorization', authorization)
                .send(
                  {
                    id: 'test',
                    texts: {description: [{locale: 'fr', text: 'tenant de test'}]},
                    contacts: ["test@example.com"]
                  }
                )
                .expect('Content-Type', /json/)
                .expect(409)
                .end((err, res) => {
                  should.not.exist(err);
                  res.body.should.have.match({
                    message: 'Already defined'
                  });
                  done();
                });
            });
        });

        it('should return error for forbidden tenant', done => {
          request(server)
            .post('/admin/tenants')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(
              {
                id: 'admin',
                texts: {description: [{locale: 'fr', text: 'tenant de test'}]},
                contacts: ["test@example.com"]
              }
            )
            .expect('Content-Type', /json/)
            .expect(409)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.have.match({
                message: 'Forbidden id'
              });
              done();
            });
        });

      });

    });

    describe('admin/tenants/{tenant}/settings', () => {

      describe('GET /admin/tenants/test/settings', () => {

        it('should return settings of the tenant', done => {
          createTestTenant()
            .then(() => {
              request(server)
                .get('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .set('Authorization', authorization)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                });
            });
        });

        it('should return settings of disabled tenant', done => {
          createDisabledTestTenant()
            .then(() => {
              request(server)
                .get('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .set('Authorization', authorization)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                });
            });
        });

        it('should fail if no Authorization', done => {
          createTestTenant()
            .then(() => {
              request(server)
                .get('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                });
            });
        });
      });

      describe('PUT /admin/tenants/test/settings', () => {

        it('should update settings of the new tenant', done => {

          createTestTenant()
            .then(() => {
              request(server)
                .put('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .set('Authorization', authorization)
                .send(DUMMY_SETTINGS)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
                  res.body.should
                    .be.empty();
                  done();
                });
            });
        });

        it('should not update settings of disabled tenant', done => {

          createDisabledTestTenant()
            .then(() => {
              request(server)
                .put('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .set('Authorization', authorization)
                .send(DUMMY_SETTINGS)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                });
            });
        });

        it('should fail if no Authorization', done => {

          createTestTenant()
            .then(() => {
              request(server)
                .put('/admin/tenants/test/settings')
                .set('Accept', 'application/json')
                .send(DUMMY_SETTINGS)
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                });
            });
        });
      });

      describe('GET /admin/tenants/unknow/settings', () => {

        it('should return 404 for unknow tenant', done => {

          request(server)
            .get('/admin/tenants/unknow/settings')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.have.match({
                message: 'No such tenant'
              });
              done();
            });
        });

      });

      describe('PUT /admin/tenants/unknow/settings', () => {

        it('should return 404 for unknow tenant', done => {

          request(server)
            .put('/admin/tenants/unknow/settings')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(DUMMY_SETTINGS)
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.have.match({
                message: 'No such tenant'
              });
              done();
            });
        });

      });

    });

  });
});
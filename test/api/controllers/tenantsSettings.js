const should = require('should');
const request = require('supertest');

const createTestTenant = require('../helpers/dbTest').createTestTenant;
const createDisbaledTestTenant = require('../helpers/dbTest').createDisbaledTestTenant;

const server = require('../../../app');

const DUMMY_SETTINGS = {
  test: 'test',
  anything: { i: "want!" }
};

require('../helpers/security/generateAuthorization')().then(authorization => {
  describe.skip('controllers manager tenants', () => {

    describe('{tenant}/settings', () => {

      describe('GET /test/settings', () => {

        it('should return settings of the new tenant', done => {
          createTestTenant().then(() => {
            request(server)
              .get('/test/settings')
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

        it('should not return settings of the disabled tenant', done => {
          createDisbaledTestTenant().then(() => {
            request(server)
              .get('/test/settings')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .expect('Content-Type', /json/)
              .expect(410)
              .end((err, res) => {
                should.not.exist(err);
                done();
              });
          });
        });

        it('should fail if no Authorization', done => {
          createTestTenant().then(() => {
            request(server)
              .get('/test/settings')
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

      describe('PUT /test/settings', () => {

        it('should return settings of the new tenant', done => {

          createTestTenant().then(() => {
            request(server)
              .put('/test/settings')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .send(DUMMY_SETTINGS)
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
                res.body.should.match(DUMMY_SETTINGS);
                done();
              });
          });
        });

        it('should not return settings of the disabled tenant', done => {

          createDisbaledTestTenant().then(() => {
            request(server)
              .put('/test/settings')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .send(DUMMY_SETTINGS)
              .expect('Content-Type', /json/)
              .expect(410)
              .end((err, res) => {
                should.not.exist(err);
                done();
              });
          });
        });

        it('should fail if no Authorization', done => {

          createTestTenant().then(() => {
            request(server)
              .put('/test/settings')
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

      describe('GET /test/rolemapping', () => {

        it('should return role mapping', done => {

          createTestTenant().then(() => {
            request(server)
              .get('/test/rolemapping')
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

      });

      describe('PUT /test/rolemapping', () => {

        it('should return updated role mapping', done => {

          createTestTenant().then(() => {
            request(server)
              .put('/test/rolemapping')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .send(
                {
                  all: [ "mng", "snd", "usr" ]
                }
              )
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
                res.body.should.match(
                  {
                    all: [ "mng", "snd", "usr" ]
                  })
                done();
              });
          });
        });

      });
      describe('PUT /test/rolemapping', () => {

        it('should return error with not allowed mapping', done => {

          createTestTenant().then(() => {
            request(server)
              .put('/test/rolemapping')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .send(
                {
                  all: ["adm"]
                }
              )
              .expect('Content-Type', /json/)
              .expect(400)
              .end((err, res) => {
                should.not.exist(err);
                res.body.message.should.match(`for groupRoleMapping/all/0, the role 'adm' is not valid`);
                done();
              });
          });
        });

      });
      describe('PUT /test/rolemapping', () => {

        it('should return error with wrong mapping', done => {

          createTestTenant().then(() => {
            request(server)
              .put('/test/rolemapping')
              .set('Accept', 'application/json')
              .set('Authorization', authorization)
              .send(
                {
                  something: ["wrong"]
                }
              )
              .expect('Content-Type', /json/)
              .expect(400)
              .end((err, res) => {
                should.not.exist(err);
                res.body.message.should.match(`for groupRoleMapping/something/0, the role 'wrong' is not valid`);
                done();
              });
          });
        });

      });

      describe('GET /unknow/settings', () => {

        it('should return 404 for unknow tenant', done => {

          request(server)
            .get('/unknow/settings')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });

      });

      describe('PUT /unknow/settings', () => {

        it('should return 404 for unknow tenant', done => {

          request(server)
            .put('/unknow/settings')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(
              {
                something: "useless"
              }
            )
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });

      });

    });

  });
});
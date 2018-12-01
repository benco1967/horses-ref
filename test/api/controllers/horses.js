const should = require('should');
const request = require('supertest');
const createTestTenant = require('../helpers/dbTest').createTestTenant;
const propertyCI = require('../helpers/shouldPropertyCI');
const horse = require('../../../api/models/horseModel');

require('../helpers/dbTest');

const server = require('../../../app');
const TEST_HORSE = {
  name: "test",
  id: "test_id",
};
const TEST_HORSE_2 = {
  name: "test_2",
  id: "test_id",
};
const TEST_HORSE_2_PATCH = [
  { op: "replace", path: "/name", value: "test_2" }
];

let authorization = null;
describe('controllers horses', () => {
  before(() => require('../helpers/security/generateAuthorization')().then(auth => authorization = auth));

  describe('GET /{tenant}/horses', () => {

    it('should return horses', done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
          request(server)
            .get('/test/horses')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should
                .be.instanceof(Array)
                .and
                .matchEach(TEST_HORSE)
                .and
                .have.length(1);
              done();
            });
        });
    });

    it('should fail if no Authorization', done => {
      createTestTenant().then(() => {
        request(server)
          .get('/test/horses')
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

  describe('POST /{tenant}/horses', () => {

    it('should return new horse id', done => {
      createTestTenant().then(() => {
        request(server)
          .post('/test/horses')
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .send(TEST_HORSE)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.be.empty();
            propertyCI(res.header.should.have, 'Link').match(/<.*?test\/horses\/test_id>;\s*rel="self";\s*method="GET";\s*title=".*?";\s*name="self";\s*type="application\/json"/);
            horse.get("test", "test_id")
              .then(horse => {
                horse.should.match(TEST_HORSE);
                done();
              });
          });
      });
    });

    it('should fail if create duplicate horse', done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
        request(server)
          .post('/test/horses')
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .expect(400)
          .send(TEST_HORSE)
          .end((err, res) => {
            should.not.exist(err);
            done();
          });
      });
    });

    it('should fail if no Authorization', done => {
      createTestTenant().then(() => {
        request(server)
          .post('/test/horses')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .send(TEST_HORSE)
          .end((err, res) => {
            should.not.exist(err);
            done();
          });
      });
    });
  });

  describe('GET /{tenant}/horses/{id}', () => {

    it('should return horse', done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
          request(server)
            .get('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect(200)
            .end((err, res) => {
              res.body.should.match(TEST_HORSE);
              done();
            });
        });
    });

    it('should return 404 for unknow horse', done => {
      createTestTenant()
        .then(() => {
          request(server)
            .get('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });
    });

    it('should fail if no Authorization', done => {
      createTestTenant().then(() => {
        request(server)
          .get('/test/horses/test_id')
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

  describe('PUT /{tenant}/horses/{id}', () => {

    it('should update horse', done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
          request(server)
            .put('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(TEST_HORSE_2)
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              horse.get("test", "test_id")
                .then(horse => {
                  horse.should.match(TEST_HORSE_2);
                  done();
                });
            });
        });
    });

    it('should return 404 for unknow horse', done => {
      createTestTenant()
        .then(() => {
          request(server)
            .put('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(TEST_HORSE)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });
    });

    it('should fail if no Authorization', done => {
      createTestTenant().then(() => {
        request(server)
          .put('/test/horses/test_id')
          .set('Accept', 'application/json')
          .send(TEST_HORSE)
          .expect('Content-Type', /json/)
          .expect(401)
          .end((err, res) => {
            should.not.exist(err);
            done();
          });
      });
    });
  });

  describe('PATCH /{tenant}/horses/{id}', () => {

    it('should update horse', done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
          request(server)
            .patch('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(TEST_HORSE_2_PATCH)
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              horse.get("test", "test_id")
                .then(horse => {
                  horse.should.match(TEST_HORSE_2);
                  done();
                });
            });
        });
    });

    it("shouldn't update horse with wrong patch", done => {
      createTestTenant()
        .then(() => {
          horse.update(null, "test", "test", TEST_HORSE);
        })
        .then(() => {
          request(server)
            .patch('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send({something: "that is not a valid patch"})
            .expect(400)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });
    });

    it('should return 404 for unknow horse', done => {
      createTestTenant()
        .then(() => {
          request(server)
            .patch('/test/horses/test_id')
            .set('Accept', 'application/json')
            .set('Authorization', authorization)
            .send(TEST_HORSE_2_PATCH)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            });
        });
    });

    it('should fail if no Authorization', done => {
      createTestTenant().then(() => {
        request(server)
          .patch('/test/horses/test_id')
          .set('Accept', 'application/json')
          .send(TEST_HORSE_2_PATCH)
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

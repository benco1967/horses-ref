const should = require('should');
const request = require('supertest');

const propertyCI = require('../helpers/shouldPropertyCI');
const utilsAndConst = require('../helpers/utilsAndConst');
const REGEX_LINK = utilsAndConst.LINK;
const REGEX_STATUS = utilsAndConst.STATUS;
const isLocaleText = utilsAndConst.isLocaleText;

require('../helpers/dbTest');

const server = require('../../../app');

describe('controllers admin general', () => {

  describe('admin', () => {

    describe('GET /admin', () => {

      it('should return general information', done => {

        request(server)
          .get('/admin')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.have.properties('title', 'description');
            propertyCI(res.header.should.have, 'Link').match(REGEX_LINK);
            done();
          });
      });

    });

    describe('GET /admin/version', () => {

      it('should return a version', done => {

        request(server)
          .get('/admin/version')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.match({
              name: 'horsesRef',
              version: v => v.should.match({
                  number: /^\d*\.\d*\.\d*$/,
                  type: /^(debug|release)$/,
                  build: /^\d*$/
                })
            });
            done();
          });
      });

    });

    describe('GET /admin/status', () => {

      it('should return a status', done => {

        request(server)
          .get('/admin/status')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.have.match({
              status: REGEX_STATUS,
              dependencies: d => d.should
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
      });

    });

    describe('GET /admin/roles', () => {

      it('should return a roles list', done => {

        request(server)
          .get('/admin/roles')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should
              .be.instanceof(Array)
              .and
              .matchEach({
                id: id => id.should.be.a.String,
                title: isLocaleText,
                summary: isLocaleText
              });
            done();
          });
      });

    });


    describe('GET /admin/license', () => {

      it('should return a license description', done => {

        request(server)
          .get('/admin/license')
          .set('Accept', 'text/xml')
          .expect('Content-Type', /xml/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            done();
          });
      });

    });

  });

});

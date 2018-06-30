const adminSettings = require('../../../api/models/adminSettings');

require('../helpers/dbTest');

describe('Admin settings', () => {

  describe('Direct test with model', () => {

    it('Implicite creation of new settings', done => {
      adminSettings.get()
        .then((settings) => {
          settings.should.match({
            groupRoleMapping: {
              "admin" : [
                "adm"
              ],
            },
          });
          done();
        });
    });

  });

});

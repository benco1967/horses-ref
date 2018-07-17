'use strict';

const createError = require('http-errors');

const logger = require('../../common/helpers/logger');
const errorLog = logger.error(`horses-controller`);
const infoLog = logger.info(`horses-controller`);

const horseModel = require('../models/horseModel');
const links = require('../helpers/linkBuilder');

//TODO
module.exports = {
  getHorses: (req, res, next) => {
    const tenantId = req.getPrm('tenant', 'value', 'id');
    horseModel.getAll(tenantId)
      .then(horses => {
        res.status(200).json(horses);
      })
      .catch(err => {
        errorLog(`Unable to get the horses: ${err.message}`);
        next(err);
      });
  },

  getHorse: (req, res, next) => {
    const tenantId = req.getPrm('tenant', 'value', 'id');
    horseModel.get(tenantId, req.params.horseId)
      .then(horse => {
        if (horse === null) {
          throw new createError.NotFound(`Unable to get the horse`);
        }
        else {
          res.status(200).json(horse);
        }
      })
      .catch(err => {
        next(err);
      });
  },

  createHorse: (req, res, next) => {
    //TODO gérer l'url dans la config
    const url = "/horsesRef";

    if (horseModel.validator(req.body)) {
      const user = req.getPrm("user");
      const tenantId = req.getPrm('tenant', 'value', 'id');
      horseModel.update(null, user.userId, tenantId, req.body)
        .then(id => {
          infoLog(`new horse ${id} created`);
          res
            .header("link",
              new links()
                .add({
                  href: `${url}/${tenantId}/horses/${id}`,
                  rel: "self",
                  title: "Refers to the newly created horse",
                  name: "self",
                  method: "GET",
                  type: "application/json"
                })
                .build())
            .status(201).end();
        })
        .catch(err => {
          next(err);
        });
    }
    else {
      errorToResponse(res, BAD_REQUEST, `invalid horse format`);
    }
  },
  updateHorse: (req, res, next) => {
    if (horseModel.validator(req.body)) {
      const horseId = req.params.horseId;
      const tenantId = req.getPrm('tenant', 'value', 'id');
      const user = req.getPrm("user");
      horseModel.update(horseId, user.userId, tenantId, req.body)
        .then(() => {
          res.status(200).end();
        })
        .catch(err => {
          next(err);
        });
    }
    else {
      next(new createError.BadRequest(`invalid horse format`));
    }
  },
  patchHorse: (req, res, next) => {
    const horseId = req.params.horseId;
    const tenantId = req.getPrm('tenant', 'value', 'id');
    const user = req.getPrm("user");
    horseModel.patch(horseId, user.userId, tenantId, req.body)
      .then(() => {
        res.status(200).end();
      })
      .catch(err => {
        next(err);
      });
  }
}

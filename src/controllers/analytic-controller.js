const express = require('express');

const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');

const analyticController = function(analyticService) {

  const router = express.Router();

  router.get('/analytics/:resourceId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const resourceId = req.params.resourceId;
      const maybeAnalytic = analyticService.findByResourceId(resourceId)

      if (!maybeAnalytic) {
        Responses.notFound(res)
      } else {
        Responses.ok(res, maybeAnalytic.representation())
      }
    }, res);
  }));

  return router;

}

module.exports = analyticController;

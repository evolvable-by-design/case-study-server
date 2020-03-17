const express = require('express');

const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');
const ReverseRouter = require('../reverse-router');

const { ANALYTIC_URL } = require('../resources')

const analyticController = function(analyticService, projectService, taskService) {

  const router = express.Router();

  router.get(ANALYTIC_URL, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const resourceId = req.params.resourceId;
      const maybeAnalytic = analyticService.findByResourceId(resourceId)

      if (!maybeAnalytic) {
        Responses.notFound(res)
      } else {
        const representation = maybeAnalytic.representation(ReverseRouter)
        representation.resourceId = resolveResourceUri(representation.resourceId, user.id, projectService, taskService)
        Responses.ok(res, representation)
      }
    }, res);
  }));

  return router;

}

function resolveResourceUri(resourceId, userId, projectService, taskService) {
  try {
    const project = projectService.findById(resourceId, userId)
    if (project) return ReverseRouter.forProject(resourceId)
  } catch (error) {
    if (error instanceof Errors.NotFound) {
      const task = taskService.findById(resourceId)
      if (task) return ReverseRouter.forTask(resourceId, task.projectId)
    } else {
      throw error
    }
  }
}

module.exports = analyticController;

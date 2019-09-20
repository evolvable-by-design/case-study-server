const express = require('express');

const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const ReverseRouter = require('../reverse-router');
const AuthService = require('../services/auth-service');

function projectController(projectService) {

  const router = express.Router()

  router.get('/projects', AuthService.withAuthOpt((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const userId = user ? user.id : undefined;
      const projects = projectService.list(userId, req.query.offset, req.query.limit);
      // TODO add hypermedia controls
      res.status(200).json(projects);
    }, res);
  }));

  router.post('/projects', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.name)) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        const newProject = projectService.create(req.body.name, req.body.isPublic, user.id);
        // TODO add hypermedia controls
        res.status(201).location(ReverseRouter.forProject(newProject)).json(newProject);
      }
    }, res);
  }));

  router.get('/project/:id', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.id);
      if (project) {
        Responses.ok(res, project);
      } else {
        Responses.notFound(res);
      }
    }, res)
  }));

  router.delete('/project/:id', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.delete(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  router.post('/project/:id/invite', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.users)) {
        Responses.badRequest(res);
      } else {
        projectService.inviteCollaborators(req.params.id, user.id, req.body.users);
        Responses.noContent(res);
      }
    }, res)
  }));

  router.post('/project/:id/archive', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.archive(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  router.post('/project/:id/unarchive', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.unarchive(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  return router;
}

module.exports = projectController;

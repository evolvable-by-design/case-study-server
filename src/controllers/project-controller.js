const express = require('express');

const utils = require('./utils');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/project');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const ReverseRouter = require('../reverse-router');
const AuthService = require('../services/auth-service');

function projectWithHypermediaControls(project) {
  return HypermediaRepresentationBuilder
    .of(project)
    .link(HypermediaControls.inviteUser(project))
    .link(HypermediaControls.createTask(project), !project.isArchived)
    .link(HypermediaControls.listTasks(project))
    .link(HypermediaControls.archive(project), !project.isArchived)
    .link(HypermediaControls.unarchive(project), project.isArchived)
    .link(HypermediaControls.delete(project), project.isArchived)
    .build();
}

function projectController(projectService) {

  const router = express.Router()

  router.get('/projects', AuthService.withAuthOpt((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const userId = user ? user.id : undefined;
      const shouldListPublicProjects = req.query.public !== undefined ? (req.query.public === 'true') : user !== undefined

      const projects = shouldListPublicProjects
        ? projectService.listPublicProjects(req.query.offset, req.query.limit)
        : projectService.list(userId, req.query.offset, req.query.limit);
      
        const representation = HypermediaRepresentationBuilder
          .of(projects)
          .representation((p) => p.map(projectWithHypermediaControls))
          .representation((p) => { return { projects: p };})
          .link(HypermediaControls.createProject)
          .build();

      res.status(200).json(representation);
    }, res);
  }));

  router.post('/projects', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.name)) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        const newProject = projectService.create(req.body.name, req.body.isPublic, user.id);
        res.status(201)
          .location(ReverseRouter.forProject(newProject))
          .json(projectWithHypermediaControls(newProject));
      }
    }, res);
  }));

  router.get('/project/:id', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.id);
      if (project) {
        Responses.ok(res, projectWithHypermediaControls(project));
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

  router.post('/project/:id/addCollaborator', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.users) || !(req.body.users instanceof Array)) {
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

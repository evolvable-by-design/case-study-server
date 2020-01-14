const express = require('express');

const utils = require('./utils');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/project');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const ReverseRouter = require('../reverse-router');
const { TechnicalIdsExtractor } = require('../utils/router-utils')
const AuthService = require('../services/auth-service');

const { PROJECTS_URL, PROJECT_URL } = require('../resources')

function projectWithHypermediaControls(project) {
  return HypermediaRepresentationBuilder
    .of(project)
    .representation(project => project.representation(ReverseRouter))
    .link(HypermediaControls.inviteUser(project))
    .link(HypermediaControls.createTask(project), !project.isArchived)
    .link(HypermediaControls.listTasks(project))
    .link(HypermediaControls.archive(project), !project.isArchived)
    .link(HypermediaControls.unarchive(project), project.isArchived)
    .link(HypermediaControls.delete(project), project.isArchived)
    .link(HypermediaControls.star(project))
    .link(HypermediaControls.analytics(project))
    .build();
}

function projectController(projectService, userService) {

  const router = express.Router()

  router.get(`${PROJECTS_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projects = projectService.list(user.id, req.query.offset, req.query.limit);
      
      const representation = HypermediaRepresentationBuilder
        .of(projects)
        .representation((p) => p.map(projectWithHypermediaControls))
        .representation((p) => { return { projects: p };})
        .link(HypermediaControls.createProject)
        .build();
      
      res.status(200).json(representation);
    }, res);
  }));

  router.post(`${PROJECTS_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if(utils.isEmpty(req.body.name)) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        const newProject = projectService.create(req.body.name, user.id);
        res.status(201)
          .location(ReverseRouter.forProject(newProject.id))
          .json(projectWithHypermediaControls(newProject));
      }
    }, res);
  }));

  router.get(`${PROJECT_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.id);
      Responses.ok(res, projectWithHypermediaControls(project));
    }, res)
  }));

  router.delete(`${PROJECT_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.delete(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  router.post(`${PROJECT_URL}/addCollaborator`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      if (utils.isEmpty(req.body.users) || !(req.body.users instanceof Array) || req.body.users.length > 5) {
        Responses.badRequest(res);
      } else {
        const users = req.body.users.map(user => {
          if (user.indexOf('@') === -1) { // user is an email address
            return user
          } else { 
            return TechnicalIdsExtractor.extractUserIdParams(user).userId
          }
        })

        projectService.inviteCollaborators(req.params.id, user.id, users);
        Responses.noContent(res);
      }
    }, res)
  }));

  router.put(`${PROJECT_URL}/archive`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.archive(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  router.put(`${PROJECT_URL}/unarchive`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      projectService.unarchive(req.params.id, user.id);
      Responses.noContent(res);
    }, res)
  }));

  router.post(`${PROJECT_URL}/star`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const project = projectService.findById(req.params.id, user.id)
      userService.switchStarredStatus(user.id, project.id)
      Responses.noContent(res);
    }, res)
  }));

  return router;
}

module.exports = projectController;

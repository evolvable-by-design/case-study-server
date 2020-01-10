const express = require('express');

const { TaskStatus, validateBusinessConstraints } = require('../models/Task');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/task');
const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');

function taskWithHypermediaControls(task) {
  return HypermediaRepresentationBuilder
    .of(task)
    .representation(t => t.taskRepresentation())
    .link(HypermediaControls.update(task))
    .link(HypermediaControls.delete(task))
    .link(HypermediaControls.moveToQa(task), task.status !== TaskStatus.qa)
    .link(HypermediaControls.complete(task), task.status === TaskStatus.qa)
    .link(HypermediaControls.analytics(task))
    .build();
}

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get('/project/:projectId/tasks', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const createdBefore = req.query.createdBefore;
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 3;
  
      if (projectService.findById(projectId, user.id)) {
        const tasks = taskService.list(projectId, createdBefore ? new Date(createdBefore) : undefined, offset, limit);
    
        var basePageUrl = `/project/${projectId}/tasks?`;
        if (createdBefore) { basePageUrl += `createdBefore=${createdBefore}&`; }
    
        const amountOfTasks = taskService.tasksCount(projectId, createdBefore);
        if (amountOfTasks > offset + limit - 1) {
          res.append('X-Next', basePageUrl + `offset=${offset+limit}&limit=${limit}`);
        }
    
        res.append('X-Last', basePageUrl + `offset=${amountOfTasks-limit > 0 ? amountOfTasks-limit : 0 }&limit=${limit}`);
    
        const representation = HypermediaRepresentationBuilder
          .of(tasks)
          .representation((t) => t.map(taskWithHypermediaControls))
          .representation((t) => { return { tasks: t };})
          .link(HypermediaControls.create(projectId))
          .build();

        res.status(200).json(representation);
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  const createTask = function(createFunction) {
    return (req, res) => AuthService.withAuth((req, res, user) => {
      Errors.handleErrorsGlobally(() => {
        const { title, description, status, assignee, tags, priority } = req.body;
        if (utils.isAnyEmpty([title, assignee])
          || !validateBusinessConstraints(title, description, undefined, status, tags, priority)
        ) {
          Responses.badRequest(res);
        } else {
          const createdTask = createFunction(req.body, req.params.projectId);
          Responses.created(res, taskWithHypermediaControls(createdTask));
        }
      }, res);
    })(req, res);
  };

  router.post('/project/:projectId/tasks/technicalStory', createTask(taskService.createTechnicalStory.bind(taskService)));

  router.post('/project/:projectId/tasks/userStory', createTask(taskService.createUserStory.bind(taskService)));

  router.get('/project/:projectId/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;
  
      if (projectService.findById(projectId, user.id)) {
        const task = taskService.findById(taskId);

        if (task) {
          Responses.ok(res, taskWithHypermediaControls(task));
        } else {
          Responses.notFound(res);
        }
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  router.put('/project/:projectId/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;

      const { title, description, status, points, tags, priority } = req.body;
      if (!projectService.findById(projectId, user.id)) {
        Responses.forbidden(res);
      } 
      const task = taskService.findById(taskId)
      if (!task) {
        Responses.notFound(res);
      } else if (!validateBusinessConstraints(task, title, description, points, status, tags, priority)) {
        Responses.badRequest(res);
      } else {
        taskService.updateTask(taskId, req.body);
        Responses.noContent(res);
      }
    }, res);
  }));

  router.delete('/project/:projectId/task/:taskId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;
  
      if (projectService.findById(projectId, user.id)) {
        taskService.delete(taskId);
        Responses.noContent(res);
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  router.put('/project/:projectId/task/:taskId/toQa', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;
  
      if (projectService.findById(projectId, user.id)) {
        taskService.updateStatus(taskId, TaskStatus.qa);
        Responses.noContent(res);
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  router.put('/project/:projectId/task/:taskId/complete', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;
  
      if (projectService.findById(projectId, user.id)) {
        taskService.updateStatus(taskId, TaskStatus.complete);
        Responses.noContent(res);
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  return router;

}

module.exports = taskController;

const express = require('express');

const { TaskStatus, validateBusinessConstraints } = require('../models/Task');
const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get('/project/:projectId/tasks', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const projectId = req.params.projectId;
      const createdAfter = req.query.createdAfter;
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 3;
  
      if (projectService.findById(projectId, user.id)) {
        const tasks = taskService.list(projectId, createdAfter ? new Date(createdAfter) : undefined, offset, limit);
    
        var basePageUrl = `/project/${projectId}/tasks?`;
        if (createdAfter) { basePageUrl += `createdAfter=${createdAfter}&`; }
    
        const amountOfTasks = taskService.tasksCount(projectId, createdAfter);
        if (amountOfTasks > offset + limit - 1) {
          res.append('X-Next', basePageUrl + `offset=${offset+limit}&limit=${limit}`);
        }
    
        res.append('X-Last', basePageUrl + `offset=${amountOfTasks-limit > 0 ? amountOfTasks-limit : 0 }&limit=${limit}`);
    
        res.status(200).json(tasks.map(t => t.taskRepresentation()));
      } else {
        Responses.forbidden(res);
      }
    }, res);
  }));

  const createTask = function(createFunction) {
    return (req, res) => AuthService.withAuth((req, res, user) => {
      Errors.handleErrorsGlobally(() => {
        const { name, description, status, assignee } = req.body;
        if (utils.isAnyEmpty([name, assignee])
          || !validateBusinessConstraints(name, description, undefined, status)
        ) {
          Responses.badRequest(res);
        } else {
          const createdTask = createFunction(req.body, req.params.projectId);
          Responses.created(res, createdTask.taskRepresentation());
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
          Responses.ok(res, task.taskRepresentation());
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

      const { name, description, status, points} = req.body;
      if (!validateBusinessConstraints(name, description, points, status)) {
        Responses.badRequest(res);
      } else if (!projectService.findById(projectId, user.id)) {
        Responses.forbidden(res);
      } else if (!taskService.findById(taskId)) {
        Responses.notFound(res);
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

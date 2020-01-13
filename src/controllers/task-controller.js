const express = require('express');

const { TaskStatus, validateBusinessConstraints } = require('../models/Task');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/task');
const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');
const AuthService = require('../services/auth-service');
const ReverseRouter = require('../reverse-router')
const { TechnicalIdsExtractor } = require('../utils/router-utils')
const { TASKS_URL, TASK_URL } = require('../resources')

function taskWithHypermediaControls(task) {
  return HypermediaRepresentationBuilder
    .of(task)
    .representation(t => t.taskRepresentation(ReverseRouter))
    .link(HypermediaControls.update(task))
    .link(HypermediaControls.delete(task))
    .link(HypermediaControls.moveToQa(task), task.status !== TaskStatus.qa)
    .link(HypermediaControls.complete(task), task.status === TaskStatus.qa)
    .link(HypermediaControls.analytics(task))
    .build();
}

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get(`${TASKS_URL}`, AuthService.withAuth((req, res, user) => {
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
        const cleanedBodyValues = replaceRelationUrlsWithTechnicalIds(req.body)
        const { title, description, status, assignee, tags, priority } = cleanedBodyValues;
        if (utils.isAnyEmpty([title, assignee])
          || !validateBusinessConstraints(undefined, title, description, undefined, status, tags, priority)
        ) {
          Responses.badRequest(res);
        } else {
          const createdTask = createFunction(cleanedBodyValues, req.params.projectId);
          Responses.created(res, taskWithHypermediaControls(createdTask));
        }
      }, res);
    })(req, res);
  };

  router.post(`${TASKS_URL}/technicalStory`, createTask(taskService.createTechnicalStory.bind(taskService)));

  router.post(`${TASKS_URL}/userStory`, createTask(taskService.createUserStory.bind(taskService)));

  router.get(`${TASK_URL}`, AuthService.withAuth((req, res, user) => {
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

  router.put(`${TASK_URL}`, AuthService.withAuth((req, res, user) => {
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
        taskService.updateTask(taskId, replaceRelationUrlsWithTechnicalIds(req.body));
        Responses.noContent(res);
      }
    }, res);
  }));

  router.delete(`${TASK_URL}`, AuthService.withAuth((req, res, user) => {
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

  router.put(`${TASK_URL}/toQa`, AuthService.withAuth((req, res, user) => {
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

  router.put(`${TASK_URL}/complete`, AuthService.withAuth((req, res, user) => {
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

function replaceRelationUrlsWithTechnicalIds(object) {
  const toReturn = Object.assign({}, object)
  if (toReturn['assignee']) {
    const ids = TechnicalIdsExtractor.extractUserIdParams(toReturn['assignee'])
    toReturn['assignee'] = ids ? ids.userId : undefined
  }

  return toReturn
}

module.exports = taskController;

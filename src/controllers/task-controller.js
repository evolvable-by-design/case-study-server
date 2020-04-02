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
const { UserRoles } = require('../models/User')

function taskWithHypermediaControls(task, user) {
  return HypermediaRepresentationBuilder
    .of(task)
    .representation(t => t.taskRepresentation(ReverseRouter))
    .link(HypermediaControls.update(task))
    .link(HypermediaControls.delete(task), user.role === UserRoles.PO)
    .link(HypermediaControls.moveToQa(task), task.status !== TaskStatus.qa)
    .link(HypermediaControls.complete(task), task.status === TaskStatus.qa)
    .link(HypermediaControls.analytics(task))
    .link(HypermediaControls.reverseArchivedState(task))
    .build();
}

const taskController = function(projectService, taskService) {

  const router = express.Router();

  router.get(`${TASKS_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const queryProjectId = req.query.queryProjectId;
      const createdBefore = req.query.createdBefore;
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 3;
  
      const projectId = projectService.existsWithId(queryProjectId, user.id) ? queryProjectId : undefined
      const tasks = taskService.list(projectId, createdBefore ? new Date(createdBefore) : undefined, offset, limit);
  
      var basePageUrl = `/tasks?`;
      if (createdBefore) { basePageUrl += `createdBefore=${createdBefore}&`; }
      if (projectId) { basePageUrl += `queryProjectId=${projectId}&`;}
  
      let linkHeaderValue = ''
      const amountOfTasks = taskService.tasksCount(projectId, createdBefore);
      if (amountOfTasks > offset + limit - 1) {
        linkHeaderValue += `<${basePageUrl}offset=${offset+limit}&limit=${limit}>; rel="hydra:next"`
      }
      linkHeaderValue += `, <${basePageUrl}offset=${amountOfTasks-limit > 0 ? amountOfTasks-limit : 0}&limit=${limit}>; rel="hydra:last"`
      res.append('Link', linkHeaderValue)
  
      const representation = HypermediaRepresentationBuilder
        .of(tasks)
        .representation((t) => t.map(task => taskWithHypermediaControls(task, user)))
        .representation((t) => { return { tasks: t };})
        .link(HypermediaControls.create(projectId))
        .build();

      res.status(200).json(representation);
    }, res);
  }));

  const createTask = function(createFunction) {
    return (req, res) => AuthService.withAuth((req, res, user) => {
      Errors.handleErrorsGlobally(() => {
        const cleanedBodyValues = replaceRelationUrlsWithTechnicalIds(req.body)
        const { title, description, status, assignee, tags, priority, parentProjectId, points } = cleanedBodyValues;
        
        if (utils.isAnyEmpty([title, assignee, parentProjectId])
          || !validateBusinessConstraints(undefined, title, description, points, status, tags, priority)
          || !projectService.existsWithId(parentProjectId, user.id)
        ) {
          Responses.badRequest(res);
        } else {
          const createdTask = createFunction(cleanedBodyValues);
          Responses.created(res, taskWithHypermediaControls(createdTask, user));
        }
      }, res);
    })(req, res);
  };

  router.post(`${TASKS_URL}/technicalStory`, createTask(taskService.createTechnicalStory.bind(taskService)));

  router.post(`${TASKS_URL}/userStory`, createTask(taskService.createUserStory.bind(taskService)));

  router.get(`${TASK_URL}`, AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      const task = taskService.findById(taskId);

      if (task) {
        Responses.ok(res, taskWithHypermediaControls(task, user));
      } else {
        Responses.notFound(res);
      }
    }, res);
  }));

  router.put(`${TASK_URL}`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;

      const { title, description, status, points, tags, priority } = req.body;
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
      const taskId = req.params.taskId;
      taskService.delete(taskId, user);
      Responses.noContent(res);
    }, res);
  }));

  router.put(`${TASK_URL}/toQa`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.updateStatus(taskId, TaskStatus.qa);
      Responses.noContent(res);
    }, res);
  }));

  router.put(`${TASK_URL}/complete`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      taskService.updateStatus(taskId, TaskStatus.complete);
      Responses.noContent(res);
    }, res);
  }));

  router.post(`${TASK_URL}/archive`, AuthService.withAuth((req, res) => {
    Errors.handleErrorsGlobally(() => {
      const taskId = req.params.taskId;
      const newArchivedState = taskService.switchArchivedStatus(taskId);
      Responses.ok(res, { isArchived: newArchivedState });
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

  if (toReturn['parentProjectId']) {
    const ids = TechnicalIdsExtractor.extractProjectIdParams(toReturn['parentProjectId'])
    toReturn['parentProjectId'] = ids ? ids.id : undefined
  }

  return toReturn
}

module.exports = taskController;

const { Link } = require('./hypermedia');
const ReverseRouter = require('../reverse-router')

module.exports = {

  update: (task) => Link('update', {
    taskId: task.id,
    id: task.id,
    title: task.title,
    description: task.description,
    assignee: ReverseRouter.forUser(task.assignee),
    points: task.points,
    status: task.status,
    tags: task.tags,
    priority: task.priority
  }),
  delete: (task) => Link('delete', { taskId: task.id }),
  moveToQa: (task) => Link('moveToQA', { taskId: task.id }),
  complete: (task) => Link('complete', { taskId: task.id }),
  create: (projectId) => Link('create', { parentProjectId: ReverseRouter.forProject(projectId) }),
  analytics: (task) => Link('analytics', { resourceId: task.id })

}
const { Link } = require('./hypermedia');

module.exports = {

  update: (task) => Link('update', {
    projectId: task.projectId,
    taskId: task.id,
    id: task.id,
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    points: task.points,
    status: task.status,
    tags: task.tags,
    priority: task.priority
  }),
  delete: (task) => Link('delete', { projectId: task.projectId, taskId: task.id }),
  moveToQa: (task) => Link('moveToQA', { projectId: task.projectId, taskId: task.id }),
  complete: (task) => Link('complete', { projectId: task.projectId, taskId: task.id }),
  create: (projectId) => Link('create', { projectId }),
  analytics: (task) => Link('analytics', { resourceId: task.id })

}
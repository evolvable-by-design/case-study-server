const { Link } = require('./hypermedia');

module.exports = {

  update: (task) => Link('update', {
    projectId: task.projectId,
    taskId: task.id,
    id: task.id,
    name: task.name,
    description: task.description,
    assignee: task.assignee,
    points: task.points,
    status: task.status
  }),
  delete: (task) => Link('delete', { projectId: task.projectId, taskId: task.id }),
  moveToQa: (task) => Link('moveToQA', { projectId: task.projectId, taskId: task.id }),
  complete: (task) => Link('complete', { projectId: task.projectId, taskId: task.id }),
  create: (projectId) => Link('create', { projectId })

}
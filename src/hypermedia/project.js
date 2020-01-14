const { Link } = require('./hypermedia');
const ReverseRouter = require('../reverse-router')

module.exports = {

  createProject: 'createProject',
  inviteUser: (project) => Link('inviteUser', { projectId: project.id }),
  createTask: (project) => [
    Link('createTechnicalStory', { parentProjectId: ReverseRouter.forProject(project.id) }),
    Link('createUserStory', { parentProjectId: ReverseRouter.forProject(project.id) })
  ],
  listTasks: (project) => Link('listTasks', { queryProjectId: project.id }),
  reverseArchivedState: (project) => Link('reverseArchivedState', { projectId: project.id }),
  delete: (project) => Link('delete', { projectId: project.id }),
  star: (project) => Link('star', { projectId: project.id }),
  analytics: (project) => Link('analytics', { resourceId: project.id })

};

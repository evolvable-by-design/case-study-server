const { Link } = require('./hypermedia');

module.exports = {

  createProject: 'createProject',
  inviteUser: (project) => Link('inviteUser', { projectId: project.id }),
  createTask: (project) => [ Link('createTechnicalStory', { projectId: project.id }), Link('createUserStory', { projectId: project.id })],
  listTasks: (project) => Link('listTasks', { projectId: project.id }),
  archive: (project) => Link('archive', { projectId: project.id }),
  unarchive: (project) => Link('unarchive', { projectId: project.id }),
  delete: (project) => Link('delete', { projectId: project.id })

};

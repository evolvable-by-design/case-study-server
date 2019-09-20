const uuidv4 = require('uuid/v4');

const Project = require('../models/Project')

class ProjectService {

  constructor(userService) {
    this.projects = []
  }

  list(userId) {
    return this.projects.filter(project => project.collaborators.includes(userId))
  }

  findById(id, userId) {
    return this.project.find(p => p.id === id && p.collaborators.includes(userId));
  }

  findByIdPromise(id, userId) {
    return new Promise(function(resolve, reject) {
      const project = findById(id, userId);
      if (project) { resolve(project) } else { reject() }
    })
  }

  create(name, owner) {
    const createdProject = new Project(uuidv4(), name, false, Date.now().toISOString(), 0, [owner]);
    this.projects.push(createdProject);
    return createdProject;
  }

  delete(id, userId) {
    findByIdPromise(id, userId)
      .then(project => this.projects.splice(this.projects.indexOf(project), 1))
  }

  archive(id, userId) {
    findByIdPromise(id, userId)
      .then(project => project.isArchived = true)
  }

  unarchive(id, userId) {
    findByIdPromise(id, userId)
      .then(project => project.isArchived = false)
  }

  inviteCollaborators(id, requesterId, collaboratorsIdOrEmail) {
    findByIdPromise(id, requesterId)
      .then(project => {
        const users = Object.assign({}, userService.all()); 
        project.addCollaborators(collaboratorsIdOrEmail
          .map(idOrEmail => {
            users.find(user => user.id === idOrEmail || user.email === idOrEmail)
          })
          .filter(entry => entry !== undefined)
        );
      });
  }

}

module.exports = ProjectService;
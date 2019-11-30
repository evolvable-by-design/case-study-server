const uuid = require('uuid/v4');

const Project = require('../models/Project');
const Errors = require('../utils/errors');

class ProjectService {

  constructor(userService) {
    this.userService = userService;
    this.projects = [
      Project.of('0e4a7fdb-b97e-42bf-a657-a61d88efb737', 'First project ever', true, 'f19869bc-a117-4c19-bc12-d907de312632')
    ]
  }

  list(userId, offset, limit) {
    const actualOffset = offset || 0;
    const actualLimit = limit || 3;

    const allRelevantProjects = userId
      ? this.projects.filter(project => project.collaborators.includes(userId))
      : this.projects.filter(project => project.isPublic)

    return allRelevantProjects.slice(actualOffset, actualOffset + actualLimit)
  }

  listPublicProjects(offset, limit) {
    const actualOffset = offset || 0;
    const actualLimit = limit || 3;

    return this.projects.filter(project => project.isPublic).slice(actualOffset, actualOffset + actualLimit);
  }

  findById(id, userId) {
    return this.projects.find(p => p.id === id && p.collaborators.includes(userId));
  }

  findByName(name, userId) {
    return this.projects.find(p => p.name === name && p.collaborators.includes(userId));
  }

  create(name, isPublic, owner) {
    const maybeDulicatedExistingProject = this.findByName(name, owner);

    if (maybeDulicatedExistingProject) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      const createdProject = Project.of(uuid(), name, isPublic || false, owner);
      this.projects.push(createdProject);
      return createdProject;
    }
  }

  delete(id, userId) {
    const project = this.findById(id, userId);

    if (!project) {
      throw new Errors.NotFound();
    } else if (!project.isArchived) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      return this.projects.splice(this.projects.indexOf(project), 1);
    }
  }

  archive(id, userId) {
    this._archive(id, userId, true);
  }

  unarchive(id, userId) {
    this._archive(id, userId, false);
  }

  _archive(id, userId, value) {
    const project = this.findById(id, userId);

    if (!project) {
      throw new Errors.NotFound();
    } else {
      project.isArchived = value;
    }
  }

  inviteCollaborators(id, requesterId, collaboratorsIdOrEmail) {
    const project = this.findById(id, requesterId);

    if (project) {
      const users = Array.from(this.userService.all());

      const collaboratorsToAdd = collaboratorsIdOrEmail
        .map(idOrEmail =>
          users.find(user => user.id === idOrEmail || user.email === idOrEmail)
        )
        .filter(entry => entry !== undefined)
        .map(user => user.id);

      project.addCollaborators(collaboratorsToAdd);
    } else {
      throw new Errors.NotFound();
    }
  }

}

module.exports = ProjectService;

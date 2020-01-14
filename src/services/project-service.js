const uuid = require('uuid/v4');

const Project = require('../models/Project');
const Errors = require('../utils/errors');

class ProjectService {

  constructor(projectRepository, userService, analyticService) {
    this.userService = userService
    this.projectRepository = projectRepository
    this.analyticService = analyticService

    this.projectRepository.save(
      Project.of('0e4a7fdb-b97e-42bf-a657-a61d88efb737', 'First project ever', 'f19869bc-a117-4c19-bc12-d907de312632')
    )
    this.analyticService.create('0e4a7fdb-b97e-42bf-a657-a61d88efb737')
  }

  list(userId, offset, limit) {
    const actualOffset = offset || 0;
    const actualLimit = limit || 5;

    return this.projectRepository.all()
      .filter(project => project.collaborators.includes(userId))
      .slice(actualOffset, actualOffset + actualLimit)
  }

  findById(id, userId) {
    const project = this.projectRepository.all().find(p => p.id === id);

    if (project === undefined) {
      throw new Errors.NotFound()
    } else if (project.collaborators.includes(userId)) {
      return project
    } else {
      throw new Errors.ForbiddenException()
    }
  }

  existsWithId(id, userId) {
    try {
      this.findById(id, userId)
      return true
    } catch (error) {
      return false
    }
  }

  existsWithName(name, userId) {
    return this.projectRepository.all().
      find(p => p.name === name && p.collaborators.includes(userId)) !== undefined;
  }

  create(name, owner) {
    const maybeDulicatedExistingProject = this.existsWithName(name, owner);

    if (maybeDulicatedExistingProject) {
      throw new Errors.BusinessRuleEnforced();
    } else {
      const createdProject = Project.of(uuid(), name, owner);
      this.projectRepository.save(createdProject);
      this.analyticService.create(createdProject.id);
      return createdProject;
    }
  }

  delete(id, userId) {
    const project = this.findById(id, userId);

    if (!project) {
      throw new Errors.NotFound()
    } else if (!project.isArchived) {
      throw new Errors.BusinessRuleEnforced()
    } else {
      this.analyticService.update(project.id);
      return this.projectRepository.delete(project)
    }
  }

  archive(id, userId) {
    const project = this.findById(id, userId);

    if (!project) {
      throw new Errors.NotFound();
    } else {
      project.isArchived = !project.isArchived;
      this.analyticService.update(project.id);
      return project.isArchived;
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
      this.analyticService.update(project.id);
    } else {
      throw new Errors.NotFound();
    }
  }

}

module.exports = ProjectService;

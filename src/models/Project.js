class Project {

  constructor(id, name, isArchived, collaborators) {
    this.id = id;
    this.name = name;
    this.isArchived = isArchived;
    this.collaborators = collaborators;
  }

  static of(id, name, creatorId) {
    return new Project(id, name, false, [creatorId]);
  }

  addCollaborators(collaborators) {
    collaborators.forEach(c => this.collaborators.push(c))
    this.collaborators = this.collaborators.filter((v,i) => this.collaborators.indexOf(v) === i)
  }

  representation(reverseRouter) {
    return {
      id: this.id,
      name: this.name,
      isArchived: this.isArchived,
      collaborators: this.collaborators.map(collaboratorId => reverseRouter.forUser(collaboratorId))
    }
  }

}

module.exports = Project;

class Project {

  constructor(id, name, isArchived, isPublic, collaborators) {
    this.id = id;
    this.name = name;
    this.isArchived = isArchived;
    this.isPublic = isPublic;
    this.collaborators = collaborators;
  }

  static of(id, name, isPublic, creatorId) {
    return new Project(id, name, false, isPublic, [creatorId]);
  }

  addCollaborators(collaborators) {
    collaborators.forEach(c => this.collaborators.push(c))
    this.collaborators = this.collaborators.filter((v,i) => this.collaborators.indexOf(v) === i)
  }

}

module.exports = Project;

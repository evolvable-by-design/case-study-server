class Project {

  constructor(id, name, isArchived, isPublic, lastUpdatedOn, updatesCount, collaborators) {
    this.id = id;
    this.name = name;
    this.isArchived = isArchived;
    this.isPublic = isPublic;
    this.lastUpdatedOn = lastUpdatedOn;
    this.updatesCount = updatesCount;
    this.collaborators = collaborators;
  }

  static of(id, name, isPublic, creatorId) {
    return new Project(id, name, false, isPublic, new Date(Date.now()).toISOString(), 0, [creatorId]);
  }

  _onUpdate() {
    this.lastUpdatedOn = new Date(Date.now()).toISOString();
    this.updatesCount++;
  }

  addCollaborators(collaborators) {
    collaborators.forEach(c => this.collaborators.push(c))
    this.collaborators = this.collaborators.filter((v,i) => this.collaborators.indexOf(v) === i)
    this._onUpdate();
  }

}

module.exports = Project;

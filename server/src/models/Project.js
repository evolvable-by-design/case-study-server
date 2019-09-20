class Project {

  constructor(id, name, isArchived, lastUpdatedOn, updatesCount, collaborators) {
    this.id = id;
    this.name = name;
    this.isArchived = isArchived;
    this.lastUpdatedOn = lastUpdatedOn;
    this.updatesCount = updatesCount;
    this.collaborators = collaborators;
  }

  _onUpdate() {
    this.lastUpdatedOn = Date.now().toISOString();
  }

  addCollaborators(collaborators) {
    collaborators.forEach(c => this.collaborators.push(c))
    this.collaborators = this.collaborators.filter((v,i) => this.collaborators.indexOf(v) === i)
    this._onUpdate();
  }

}

module.exports = Project;

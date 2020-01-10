const uuid = require('uuid/v4');

class Analytic {

  constructor(id, resourceId, createdOn, lastUpdatedOn, updatesCount) {
    this.id = id
    this.resourceId = resourceId
    this.createdOn = createdOn
    this.lastUpdatedOn = lastUpdatedOn
    this.updatesCount = updatesCount
  }

  static of(resourceId) {
    const now = new Date(Date.now()).toISOString()
    return new Analytic(uuid(), resourceId, now, now, 0)
  }

  update() {
    return new Analytic(this.id, this.resourceId, this.createdOn, new Date(Date.now()).toISOString(), this.updatesCount+1)
  }

  representation() {
    return {
      resourceId: this.resourceId,
      createdOn: this.createdOn,
      lastUpdatedOn: this.lastUpdatedOn,
      updatesCount: this.updatesCount
    }
  }

}

module.exports = Analytic;

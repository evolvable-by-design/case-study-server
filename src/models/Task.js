class Task {
  constructor(id, title, points, projectId, description, assignee, lastUpdate, status, isArchived, updatesCount) {
    this.id = id;
    this.title = title;
    this.points = points;
    this.projectId = projectId;
    this.description = description;
    this.assignee = assignee;
    this.lastUpdate = lastUpdate;
    this.status = status;
    this.isArchived = isArchived;
    this.updatesCount = updatesCount;
  }

  isUserStory() { return this.points !== undefined }

  isTechnicalStory() { return !this.isUserStory() }

  _onUpdate() {
    this.lastUpdate = new Date(Date.now());
    this.updatesCount++;
  }

  static ofUserStory(id, projectId, title, description, assignee, points, status) {
    return new Task(id, title, points, projectId, description || '', assignee, new Date(Date.now()), status, false, 0);
  }

  static ofTechnicalStory(id, projectId, title, description, assignee, status) {
    return new Task(id, title, undefined, projectId, description, assignee, new Date(Date.now()), status, false, 0);
  }

  taskRepresentation() {
    const representation = {
      id: this.id,
      title: this.title,
      projectId: this.projectId,
      description: this.description || '',
      assignee: this.assignee,
      lastUpdate: this.lastUpdate.toISOString().split('T')[0],
      status: this.status,
      // isArchived: this.isArchived,
      updatesCount: this.updatesCount
    };

    if (this.isUserStory()) {
      representation['points'] = this.points;
    }

    return representation;
  }

};

const TaskStatus = {
  todo: 'todo',
  inProgress: 'todo',
  review: 'review',
  qa: 'QA',
  complete: 'done'
};

const TaskStatusFreeToMove = {
  todo: 'todo',
  inProgress: 'in progress',
  review: 'review'
};

const validateBusinessConstraints = (task, title, description, points, status) => {
  if (title && (title.length <3 || title.length > 40)) {
    return false;
  } else if (description && description.length > 2000) {
    return false;
  } else if (status && status !== task.status && !Object.values(TaskStatusFreeToMove).includes(status)) {
    return false;
  } else if (points && (points < 0.5 || points > 40)) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  TaskStatus,
  TaskStatusFreeToMove,
  validateBusinessConstraints,
  Task
}
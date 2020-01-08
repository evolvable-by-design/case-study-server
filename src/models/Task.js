class Task {
  constructor(id, title, points, projectId, description, assignee, creationDate, lastUpdate, status, isArchived, updatesCount, tags, priority) {
    this.id = id;
    this.title = title;
    this.points = points;
    this.projectId = projectId;
    this.description = description;
    this.assignee = assignee;
    this.creationDate = creationDate;
    this.lastUpdate = lastUpdate;
    this.status = status;
    this.isArchived = isArchived;
    this.updatesCount = updatesCount;
    this.tags = tags;
    this.priority = priority;
  }

  isUserStory() { return this.points !== undefined }

  isTechnicalStory() { return !this.isUserStory() }

  _onUpdate() {
    this.lastUpdate = new Date(Date.now());
    this.updatesCount++;
  }

  static ofUserStory(id, projectId, title, description, assignee, creationDate, points, status, tags, priority) {
    return new Task(id, title, points, projectId, description || '', assignee, creationDate, new Date(Date.now()), status, false, 0, tags, priority);
  }

  static ofTechnicalStory(id, projectId, title, description, assignee, creationDate, status, tags, priority) {
    return new Task(id, title, undefined, projectId, description, assignee, creationDate, new Date(Date.now()), status, false, 0, tags, priority);
  }

  taskRepresentation() {
    const representation = {
      id: this.id,
      title: this.title,
      parentProjectId: this.projectId,
      description: this.description || '',
      assignee: this.assignee,
      creationDate: this.creationDate.toISOString().split('T')[0],
      lastUpdate: this.lastUpdate.toISOString().split('T')[0],
      status: this.status,
      updatesCount: this.updatesCount,
      tags: this.tags,
      priority: this.priority
      // isArchived: this.isArchived,
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

const Priority = {
  blocking: 'blocking',
  important: 'important',
  high: 'high',
  medium: 'medium',
  low: 'low',
  simple: 'simple',
  critical: 'critical'
}

const validateBusinessConstraints = (task, title, description, points, status, tags, priority) => {
  if (title && (title.length < 4 || title.length > 80)) {
    return false;
  } else if (description && description.length > 4000) {
    return false;
  } else if (status && status !== task.status && !Object.values(TaskStatusFreeToMove).includes(status)) {
    return false;
  } else if (points && (points < 0 || points > 120)) {
    return false;
  } else if (tags && tags.length > 10) {
    return false;
  } else if (priority && !Object.values(Priority).includes(priority)) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  TaskStatus,
  TaskStatusFreeToMove,
  validateBusinessConstraints,
  Task,
  Priority
}
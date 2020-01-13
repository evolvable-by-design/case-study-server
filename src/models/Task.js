class Task {
  constructor(id, title, points, projectId, description, assignee, status, isArchived, tags, priority) {
    this.id = id;
    this.title = title;
    this.points = points;
    this.projectId = projectId;
    this.description = description;
    this.assignee = assignee;
    this.status = status;
    this.isArchived = isArchived;
    this.tags = tags;
    this.priority = priority;
  }

  isUserStory() { return this.points !== undefined }

  isTechnicalStory() { return !this.isUserStory() }

  static ofUserStory(id, projectId, title, description, assignee, points, status, tags, priority) {
    return new Task(id, title, points, projectId, description || '', assignee, status, false, tags, priority);
  }

  static ofTechnicalStory(id, projectId, title, description, assignee, status, tags, priority) {
    return new Task(id, title, undefined, projectId, description, assignee, status, false, tags, priority);
  }

  taskRepresentation(reverseRouter) {
    const representation = {
      id: this.id,
      title: this.title,
      parentProjectId: reverseRouter.forProject(this.projectId),
      description: this.description || '',
      assignee: reverseRouter.forUser(this.assignee),
      status: this.status,
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
  } else if (status && (!task || status !== task.status) && !Object.values(TaskStatusFreeToMove).includes(status)) {
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
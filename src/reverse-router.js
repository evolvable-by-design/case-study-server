const Project = require('./models/Project');
const { User } = require('./models/User');
const { Task } = require('./models/Task');

const ReverseRouter = {

  forUser: function(userId) {
    if (userId === undefined) return undefined
    return '/user/' + userId
  },

  forProject: function(projectId) {
    if (projectId === undefined) return undefined
    return '/project/' + projectId;
  },

  forTask: function(taskId, projectId) {
    if (taskId === undefined || projectId === undefined) return undefined
    return '/project/' + projectId + '/task/' + taskId
  },

  resolve: function(value) {
    if (value instanceof User) {
      return this.forUser(value);
    } else if (value instanceof Project) {
      return this.forProject(value)
    } else if (value instanceof Task) {
      return '/project/' + value.projectId + '/tasks/' + value.id;
    }
  }

};

module.exports = ReverseRouter
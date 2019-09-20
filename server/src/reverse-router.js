const Project = require('./models/Project');
const { User } = require('./models/User');
const { Task } = require('./models/Task');

module.exports = {

  forUser: function(user) {
    return '/user/' + user.id
  },

  forProject: function(project) {
    return '/project/' + project.id;
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
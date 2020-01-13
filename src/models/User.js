class User {

  constructor(id, username, password, email, role, starredProjects) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.confirmedEmail = false;
    this.password = password;
    this.role = role;
    this.starredProjects = starredProjects || [];
  }

  confirmEmail() {
    this.confirmedEmail = true;
  }

  publicRepresentation() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role
    };
  }

  withoutPasswordRepresentation(reverseRouter) {
    const representation = Object.assign({}, this);
    representation['password'] = undefined;
    representation['starredProjects'] = this.starredProjects
      .map(projectId => reverseRouter.forProject(projectId))
    return representation;
  }

}

const UserRoles = {
  PO: 'ProductOwner',
  Developer: 'Developer',
  default: this.Developer
}

module.exports = {
  User,
  UserRoles
}
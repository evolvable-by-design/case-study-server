const uuidv4 = require('uuid/v4')

class User {

  constructor(username, password, email, website, role) {
    this.id = uuidv4();
    this.username = username;
    this.email = email;
    this.confirmedEmail = false;
    this.password = password;
    this.website = website;
    this.role = role;
  }

  confirmEmail() {
    this.confirmedEmail = true;
  }

  publicRepresentation() {
    return {
      username: this.username,
      email: this.email,
      website: this.website,
      role: this.role
    };
  }

  withoutPasswordRepresentation() {
    const representation = Object.assign({}, this);
    representation['password'] = undefined;
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
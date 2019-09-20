const uuid = require('uuid/v4')

const AuthService = require('./auth-service')

const UserModule = require('../models/User')
const User = UserModule.User
const UserRoles = UserModule.UserRoles

const Errors = require('../utils/errors')

class UserService {

  constructor() {
    this.users = [
      new User('1', 'AntoineCheron', 'antoine', 'cheron.antoine@gmail.com', null, UserRoles.PO),
      new User('2', 'Foofoo', 'bar', 'foo@bar.com', null, UserRoles.Developer)
    ]
    this.users.forEach(u => u.confirmEmail())

    this.emailConfirmationTokens = {}
  }

  all() {
    return this.users;
  }

  _findById(id) {
    return this.users.find(user => user.id === id );  
  }

  findById(id, requesterId) {
    const foundUser = this.users.find(user => user.id === id );
    if (foundUser && id === requesterId) {
      return foundUser.withoutPasswordRepresentation();
    } else if (foundUser) {
      return foundUser.publicRepresentation();
    } else {
      throw new Errors.NotFound
    }
  }

  areUsernameAndEmailFree(username, email) {
    return this.users.find(user => user.username === username || user.email === email) === undefined
  }

  create({username, password, email, website, role}, userCreator) {
    if (userCreator && userCreator.role == UserRoles.PO) {
      if (!this.areUsernameAndEmailFree(username, email)) {
        throw new Errors.BusinessRuleEnforced()
      }

      const actualRole = role ? role : UserRoles.default;
      const newUser = new User(uuid(), username, password, email, website, actualRole);

      this.users.push(newUser);

      const emailConfirmationToken = uuid();
      this.emailConfirmationTokens[emailConfirmationToken] = newUser;

      console.log('Confirmation token for email: ' + newUser.email + ' is: ' + emailConfirmationToken);

      return newUser.withoutPasswordRepresentation();
    } else {
      throw new Errors.ForbiddenException()
    }
  }

  updateUserPassword(user, previousPassword, newPassword) {
    const userInstance = this._findById(user.id);

    if (userInstance && userInstance.password === previousPassword) {
      userInstance.password = newPassword;
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  confirmEmailOwnership(token) {
    const maybeMatchingUser = this.emailConfirmationTokens[token];
    
    if (maybeMatchingUser) {
      maybeMatchingUser.confirmEmail();
      this.emailConfirmationTokens[maybeMatchingUser] = undefined;
    } else {
      throw new Errors.UnknownEmailConfirmationTokenError();
    }
  }
  
  login(username, password) {
    const maybeUser = this.users.find(user => user.username === username && user.password === password)

    if (maybeUser && !maybeUser.confirmedEmail) {
      throw new Error.BusinessRuleEnforced();
    } else if (maybeUser && maybeUser.confirmEmail) {
      return AuthService.generateToken(maybeUser);
    } else {
      throw new Errors.WrongCredentialsException();
    }
  }

  logout(token) {
    AuthService.rejectToken(token);
  }

}

module.exports = new UserService();

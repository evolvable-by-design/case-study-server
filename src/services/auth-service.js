const jwt = require('jsonwebtoken')

const secret = "fdfbb8b9-8db4-43b9-9f7c-a15b6d9423c9";
const signinAlgorithmOptions = { algorithm: 'HS256', expiresIn: '1h' };

const tokensToReject = [];

class AuthService {

  static generateToken(user) {
    return jwt.sign(Object.assign({}, user), secret, signinAlgorithmOptions);
  }

  static verifyToken(token) {
    return new Promise(function(resolve, reject) {
      jwt.verify(token, secret, function(err, decoded) {
        if (err) { reject(err) } else { resolve(decoded) }
      })
    });
  }

  static withAuth(callback) {
    return this.withAuthOrElse(callback, (req, res) => res.redirect(401, '/users/login'));
  }

  static withAuthOpt(callback) {
    return (req, res) => {
      const authHeader = req.header('Authorization');
      const authToken = authHeader ? authHeader.replace('Bearer ', '') : undefined

      if (authToken && tokensToReject.includes(authToken)) {
        return res.redirect(401, '/users/login');
      } else if (!authHeader) {
        return callback(req, res, undefined);
      } else {
        return this.verifyToken(authToken)
          .then(user => callback(req, res, user))
          .catch(notUsedErr => callback(req, res, undefined));
      }
    }
  }

  static withAuthOrElse(callback, orElse) {
    return this.withAuthOpt((req, res, user) => {
      if (user) {
        return callback(req, res, user)
      } else {
        return orElse(req, res)
      }
    })
  }

  static rejectToken(token) {
    tokensToReject.push(token.replace('Bearer ', ''))
  }

}

module.exports = AuthService;
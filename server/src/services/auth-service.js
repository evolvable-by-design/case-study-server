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

  static withAuth(req, res, callback) {
    const authHeader = req.header('Authorization');
    const authToken = authHeader.replace('Bearer ', '')

    if (!authToken || tokensToReject.includes(authToken)) { res.redirect(401, '/users/login') }

    this.verifyToken(authToken)
      .then(user => callback(req, res, user))
      .catch(notUsedErr => res.redirect(401, '/users/login'));
  }

  static rejectToken(token) {
    tokensToReject.push(token.replace('Bearer ', ''))
  }

}

module.exports = AuthService;
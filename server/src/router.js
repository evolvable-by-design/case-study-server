var express = require('express')

var router = express.Router();

const UserService = require('./services/user-service');

const userService = new UserService();

router.use(require('./controllers/documentation'))
router.use(require('./controllers/user-controller')(userService))

module.exports = router;

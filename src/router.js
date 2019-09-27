var express = require('express');

var router = express.Router();

const userService = require('./services/user-service');
const projectService = new (require('./services/project-service'))(userService);
const taskService = require('./services/task-service');

router.use(require('./controllers/documentation'))
router.use(require('./controllers/user-controller')(userService))
router.use(require('./controllers/project-controller')(projectService))
router.use(require('./controllers/task-controller')(projectService, taskService))

module.exports = router;

var express = require('express');

var router = express.Router();

const CrudRepository = require('./repositories/crud-repository');
const analyticRepository = new CrudRepository();
const projectRepository = new CrudRepository();
const taskRepository = new CrudRepository();

const analyticService = new (require('./services/analytic-service'))(analyticRepository, projectRepository, taskRepository);
const userService = require('./services/user-service');
const projectService = new (require('./services/project-service'))(projectRepository, userService, analyticService);
const taskService = new (require('./services/task-service'))(taskRepository, analyticService);

router.use(require('./controllers/documentation'))
router.use(require('./controllers/user-controller')(userService))
router.use(require('./controllers/project-controller')(projectService, userService))
router.use(require('./controllers/task-controller')(projectService, taskService))
router.use(require('./controllers/analytic-controller')(analyticService))

module.exports = router;

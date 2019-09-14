var express = require('express')

var router = express.Router();
router.use(require('./controllers/documentation'))

module.exports = router;
var express = require('express');
var YAML = require('yamljs');

var docs = YAML.load(__dirname + '/../docs/openapi.yaml');

var router = express.Router()

router.options('/',
  (req, res) =>
    res.status(200).json(docs)
  );

module.exports = router
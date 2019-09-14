var express = require('express');
var YAML = require('yamljs');

var docs = YAML.load(__dirname + '/../docs/openapi.yaml');
var docsStr = YAML.stringify(docs);

var router = express.Router()

router.route('/')
  .options((req, res) =>
    res.status(200).type('json').send(docsStr)
  )

module.exports = router
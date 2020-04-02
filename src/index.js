var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: true,
  exposedHeaders: [ 'X-Next', 'X-Last', 'Link' ]
}));
app.use(require('./router'));

app.listen(3000,function(){
    console.log("We have started our server on port 3000");
});
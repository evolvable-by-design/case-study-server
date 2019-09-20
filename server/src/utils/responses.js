const ReverseRouter = require('../reverse-router');
const Errors = require('../utils/errors');

module.exports = {

  _no_body: function(code, res) {
    res.status(code).send();
  },

  _response: function(code, body, res) {
    res.status(code).json(body);
  },

  _error: function(code, res) {
    res.status(code).json(Errors.HttpError(code));
  },

  ok: function(res, body) {
    this._response(200, body, res);
  },

  created: function(res, createdEl) {
    const location = ReverseRouter.resolve(createdEl);
    if (location) { res.location(location); }
    res.status(201).json(createdEl);
  },

  noContent: function(res) { this._no_body(204, res); },

  badRequest: function(res) { this._error(400, res); },

  forbidden: function(res) { this._error(403, res); },

  notFound: function(res) { this._error(404, res); }

}

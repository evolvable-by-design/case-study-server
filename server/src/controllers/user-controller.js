var express = require('express');

var utils = require('./utils');
var Errors = require('../errors/Errors');
var ReverseRouter = require('../reverse-router');
var AuthService = require('../services/auth-service');

function userController(userService) {

  var router = express.Router()

  router.post('/users', (req, res) => AuthService.withAuth(req, res,
    (req, res, user) => {
      if(utils.isAnyEmpty([req.body.username, req.body.password, req.body.email])) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        Errors.handleErrorsGlobally(() => {
          const createdUser = userService.create(req.body, user);
          // TODO add hypermedia controls
          return res.status(201).location(ReverseRouter.forUser(createdUser)).json(createdUser);
        }, res);
      }
    })
  );

  router.get('/users/confirm', (req, res) => {
    if (utils.isEmpty(req.query.token)) {
      res.status(400).send(new Errors.HttpError(400));
    }

    Errors.handleErrorsGlobally(() => {
      userService.confirmEmailOwnership(req.query.token)
      res.status(204).send();
    }, res);
  });

  router.post('/users/login', (req, res) => {
    if (utils.isAnyEmpty([req.body.username, req.body.password])) {
      res.status(400).send(new Errors.HttpError(400));
    } else {
      Errors.handleErrorsGlobally(() => {
        const token = 'Bearer ' + userService.login(req.body.username, req.body.password);
        res.status(200).send({ token });
      }, res);
    }
  });

  router.post('/users/logout', (req, res) => AuthService.withAuth(req, res,
    (req, res, user) => {
      userService.logout(req.header('Authorization'));
      res.status(204).send();
  }));

  router.get('/user/:userId', (req, res) => AuthService.withAuth(req, res,
    (req, res, user) => {
      Errors.handleErrorsGlobally(() => {
        const foundUser = userService.findById(req.path.userId, user.id);
        if (foundUser) {
          res.status(200).json(foundUser);
        } else {
          res.status(500).json(new Errors.HttpError(500));
        }
      }, res);
    }
  ));

  router.get('/user', (req, res) => AuthService.withAuth(req, res,
    (req, res, user) => {
      Errors.handleErrorsGlobally(() => {
        const foundUser = userService.findById(user.id, user.id);
        if (foundUser) {
          res.status(200).json(foundUser);
        } else {
          res.status(500).json(new Errors.HttpError(500));
        }
      }, res);
    }
  ));

  router.put('/user/password', (req, res) => AuthService.withAuth(req, res, 
    (req, res, user) => {
      if(utils.isAnyEmpty([req.body.previousPassword, req.body.newPassword])) {
        res.status(400).send(new Errors.HttpError(400));
      } else {
        Errors.handleErrorsGlobally(() => {
          userService.updateUserPassword(user, req.body.previousPassword, req.body.newPassword);
          res.status(204).send();
        }, res);
      }
    }
  ));

  return router;
}

module.exports = userController;
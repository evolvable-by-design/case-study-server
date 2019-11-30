var express = require('express');

var utils = require('./utils');
var Errors = require('../utils/errors');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/user');
var ReverseRouter = require('../reverse-router');
var AuthService = require('../services/auth-service');

function userController(userService) {

  var router = express.Router()

  router.post('/users', AuthService.withAuth((req, res, user) => {
    if(utils.isAnyEmpty([req.body.username, req.body.password, req.body.email])) {
      res.status(400).send(new Errors.HttpError(400));
    } else {
      Errors.handleErrorsGlobally(() => {
        const createdUser = userService.create(req.body, user);
        
        const representation = HypermediaRepresentationBuilder
          .of(createdUser)
          .representation((u) => u.withoutPasswordRepresentation())
          .link(HypermediaControls.confirmEmail)
          .build();

        res.status(201).location(ReverseRouter.forUser(createdUser)).json(representation);
      }, res);
    }
  }));

  router.get('/users/confirm', (req, res) => {
    if (utils.isEmpty(req.query.token)) {
      res.status(400).send(new Errors.HttpError(400));
    }

    Errors.handleErrorsGlobally(() => {
      userService.confirmEmailOwnership(req.query.token)
      res.status(204).send();
    }, res);
  });

  router.post('/user/login', (req, res) => {
    if (utils.isAnyEmpty([req.body.username, req.body.password])) {
      res.status(400).send(new Errors.HttpError(400));
    } else {
      Errors.handleErrorsGlobally(() => {
        const token = 'Bearer ' + userService.login(req.body.username, req.body.password);

        const representation = HypermediaRepresentationBuilder
          .of({ token })
          .link(HypermediaControls.logout)
          .link(HypermediaControls.listProjects)
          .link(HypermediaControls.getUserDetails)
          .build();

        res.status(200).send(representation);
      }, res);
    }
  });

  router.post('/user/logout', AuthService.withAuth((req, res, user) => {
    userService.logout(req.header('Authorization'));
    res.status(204).send();
  }));

  router.get('/user/:userId', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const foundUser = userService.findById(req.params.userId, user.id);
      if (foundUser) {
        res.status(200).json(foundUser.publicRepresentation());
      } else {
        res.status(500).json(new Errors.HttpError(500));
      }
    }, res);
  }));

  router.get('/user', AuthService.withAuth((req, res, user) => {
    Errors.handleErrorsGlobally(() => {
      const foundUser = userService.findById(user.id, user.id);
      if (foundUser) {
        const representation = HypermediaRepresentationBuilder
          .of(foundUser)
          .representation((u) => u.withoutPasswordRepresentation())
          .link(HypermediaControls.listProjects)
          .link(HypermediaControls.updateUserPassword)
          .build();

        res.status(200).json(representation);
      } else {
        res.status(500).json(new Errors.HttpError(500));
      }
    }, res);
  }));

  router.put('/user/password', AuthService.withAuth((req, res, user) => {
    if(utils.isAnyEmpty([req.body.previousPassword, req.body.newPassword])) {
      res.status(400).send(new Errors.HttpError(400));
    } else {
      Errors.handleErrorsGlobally(() => {
        userService.updateUserPassword(user, req.body.previousPassword, req.body.newPassword);
        res.status(204).send();
      }, res);
    }
  }));

  return router;
}

module.exports = userController;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Record Riots!' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log into Record Riots!' });
});

router.get('/forgot', function(req, res, next) {
  res.render('forgot', { title: 'Reset your password' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register for free' });
});

router.post('/register', function(req, res, next) {
  // hash the password
  User.create({email: req.body.email, password: req.body.password}, function(err, newUser) {
    if (err) return handleError(err);
    res.send(`User account for ${newUser.email} created.`);
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
router.get('/', function(req, res, next) {
  let showsArray;
  Post.find(function(err, posts) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    showsArray = posts;
    console.log('showsArray:\n', showsArray);
    if (req.session.isLoggedIn) {
      res.render('index', {
        username: req.session.username,
        isLoggedIn: true,
        showsArray: showsArray
      });
    } else {
      res.render('index', {
        title: 'Record Riots!',
        showsArray: showsArray
      });
    }
  });
});

// get login page
router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Log into Record Riots!'
  });
});

// user login
router.post('/login', function(req, res, next) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (!user) {
      res.send(`${req.body.email} is not registered`);
    } else {
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (err) {
          console.log(err);
          res.send('An error occured.');
        }
        if (result == true) {
          req.session.isLoggedIn = true;
          req.session.username = user.username;
          res.redirect('/');
        } else {
          res.send('Password incorrect, please go back and try again.');
        }
      });
    }
  });
});

// get forgot password page
router.get('/forgot', function(req, res, next) {
  res.render('forgot', {
    title: 'Reset your password'
  });
});

// get user registration page
router.get('/register', function(req, res, next) {
  res.render('register', {
    title: 'Register for free'
  });
});

// user registration
router.post('/register', function(req, res, next) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (user) {
      console.log(user);
      res.send(`${req.body.email} already registered`);
      return;
    } else {
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
          console.log(err);
          res.send('An error occured.');
          return;
        }
        User.create({
          username: req.body.username,
          email: req.body.email,
          password: hash
        }, function(err, newUser) {
          if (err) {
            console.log(err);
            res.send('An error occured.');
            return;
          }
          req.session.isLoggedIn = true;
          req.session.username = req.body.username;
          res.redirect('/');
        });
      });
    }
  });
});

// add a show
router.get('/add-show', function(req, res, next) {
  if (req.session.isLoggedIn) {
    res.render('add-show', {
      username: req.session.username,
      isLoggedIn: true
    });
  } else {
    res.send('You must be logged in to add a show.');
  }
});

router.post('/add-show', function(req, res, next) {
  let show = {
    date: req.body.date,
    name: req.body.name,
    venue: req.body.venue,
    hours: req.body.hours,
    admission: req.body.admission,
    comments: req.body.comments
  };
  Post.create(show, function(err, newPost) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    } else {
      res.redirect('/')
    }
  })
});

// user logout
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    console.log('/logout called\n', req.session);
    res.render('logout', {
      title: 'You have been logged out.'
    });
  });
});

module.exports = router;

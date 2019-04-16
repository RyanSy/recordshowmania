var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('req.session.isLoggedIn: ', req.session.isLoggedIn);
  let showsArray;
  Post.find(function(err, posts) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (req.session.isLoggedIn) {
      res.render('index', {
        title: 'Record Riots!',
        username: req.session.username,
        isLoggedIn: true,
        posts: posts
      });
    } else {
      res.render('index', {
        title: 'Record Riots!',
        posts: posts
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
  if (req.session.isLoggedIn) {
    res.send("You are currently logged in.");
  } else {
    res.render('register', {
      title: 'Register for free'
    });
  }
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
  // format start and end times
  let show = {
    date: moment(req.body.date).format('dddd, MMMM Do, YYYY'),
    name: req.body.name,
    venue: req.body.venue,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    start: req.body.start,
    end: req.body.end,
    admission: req.body.admission,
    details: req.body.details,
    posted_by: req.session.username
  };
  Post.create(show, function(err, newPost) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    } else {
      console.log('show crested:\n', newPost);
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

// Search
router.post('/search', function(req, res) {
  var dateFormatted = moment(req.body.date).format('MMMM Do, YYYY');
  console.log(dateFormatted);
  Post.find({
    $or: [
      { 'date': dateFormatted },
      { 'state': req.body.state}
    ]
  }, function(err, posts) {
    console.log(req.body.state);
    console.log('/search route called\nposts:\n', posts);
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (posts.length == 0) {
      if (req.session.isLoggedIn) {
        res.render('no-results', {
          title: 'Record Riots!',
          username: req.session.username,
          isLoggedIn: true,
          posts: posts
        });
      } else {
        res.render('no-results', {
          title: 'Record Riots!',
        });
      }
    } else {
      if (req.session.isLoggedIn) {
        res.render('search-results', {
          title: 'Record Riots!',
          username: req.session.username,
          isLoggedIn: true,
          posts: posts
        });
      } else {
        res.render('search-results', {
          title: 'Record Riots!',
          posts: posts
        });
      }
    }
  });
});

router.post('/forgot', function(req, res) {
  // using SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs
  /*
  to do:
  set random token using crypto, then set it to expire
  */
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: req.body.email,
    from: 'test@example.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sgMail.send(msg);
  res.send('Check your email for password reset instructions.');
});

module.exports = router;

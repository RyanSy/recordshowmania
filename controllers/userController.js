var User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// display user registration page
exports.display_registration = function(req, res) {
  if (req.session.isLoggedIn == true) {
    res.send("You are currently logged in.");
  } else {
    res.render('register', {
      title: 'Register for free'
    });
  }
}

// register user 
exports.register_user = function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (user) {
      console.log(user);
      res.send(`${req.body.email} already registered`);
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
}

// display login page
exports.display_login = function(req, res) {
  res.render('login', {
    title: 'Log into Record Show Mania'
  });
}

// login user
exports.login_user = function(req, res, next) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.send('An error occured.');
    }
    if (!user) {
      res.send(`${req.body.email} is not registered.`);
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
}

// display forgot password page
exports.display_forgot = function(req, res) {
  res.render('forgot', {
    title: 'Reset your password'
  });
}

// send reset password email
exports.send_reset = function(req, res) {
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
}

// get reset password form
exports.get_reset_password = function(req, res) {
  res.render('forgot');
}

// reset password

// logout user
exports.logout_user = function(req, res) {
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
}

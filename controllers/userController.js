require('dotenv').config();
var User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var crypto = require('crypto');

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
      res.send(`${req.body.email} is already registered.`);
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
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log(err);
      res.send('An error occured logging in user.');
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
    title: 'Enter your email address to reset your password.'
  });
}

// send reset password email
exports.send_reset = function(req, res) {
  var token = crypto.randomBytes(32).toString('hex');
  var token_expires = Date.now() + 3600000;
  let update = {
    reset_password_token: token,
    reset_password_token_expires: token_expires
  };
  User.findOneAndUpdate({ email: req.body.email }, update, function(err, user) {
    if (err) {
      console.log('An error occured finding user.');
      res.send('An error occured finding user.');
    }
    if (!user) {
      res.send('That user does not exist. Please go back and try again.');
    } else {
      console.log(`Reset password token added for ${req.body.email}.`);
    }
  });
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: req.body.email,
    from: 'no-reply@recordshowmania.com',
    subject: 'Record Show Mania',
    text: 'Click the link below to reset your password:',
    html: `<a href="https://www.recordshowmania.com/reset/${token}">https://www.recordshowmania.com/reset/${token}</a>`
  };
  sgMail.send(msg);
  res.send('Check your email for password reset instructions.');
}

// display reset password page
exports.display_reset = function(req, res) {
  console.log(req.params.token);
  User.findOne({ reset_password_token: req.params.token }, function(err, user) {
    console.log(user);
    if (err) {
      console.log('An error occured findng user.');
      res.send('An error occured finding user.');
    }
    if (!user) {
      console.log('That user does not exist.');
      res.send('An error occured locating user.');
    } else {
      if (user.reset_password_token_expires < Date.now()) {
        res.send('Reset password token has expired, please try again.');
      } else {
        res.render('reset-password', {reset_password_token: req.params.token});
      }
    }
  });
}

// reset password
exports.reset_password = function(req, res) {
  if (req.body.password != req.body.confirm_password) {
    res.send('Passwords do not match.');
  } else {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if (err) {
        console.log(err);
        res.send('An error updating password.');
      }
      let update = {
        password: hash
      };
      User.findOneAndUpdate({ reset_password_token:  req.body.reset_password_token }, update, function(err, user) {
        req.session.isLoggedIn = true;
        req.session.username = user.username;
        res.redirect('/password-updated');
      });
    });
  }
}

// display password updated confirmation page
exports.password_updated = function(req, res) {
  if (req.session.isLoggedIn == true) {
    res.render('password-updated', {
      isLoggedIn: true,
      username: req.session.username
    });
  } else {
    res.send('You are not authorized to view this page.');
  }
}

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

require('dotenv').config();
var User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var crypto = require('crypto');

// display user registration page
exports.display_registration = function(req, res) {
  if (req.session.isLoggedIn == true) {
    res.redirect('/');
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
      res.render('error', {message: 'An error occured registering that user'});
    } else {
      if (user) {
        console.log(user);
        res.render('already-registered', {email: req.body.email});
      } else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          if (err) {
            console.log(err);
            res.render('error', {message: 'An error occured registering that user'});
          } else {
            User.create({
              username: req.body.username,
              email: req.body.email,
              password: hash
            }, function(err, newUser) {
              if (err) {
                console.log(err);
                res.render('error', {message: 'An error occured registering that user'});
              } else {
                req.session.isLoggedIn = true;
                req.session.username = req.body.username;
                res.redirect('/');
              }
            });
          }
        });
      }
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
      res.render('error', {message: 'An error occured logging in that user'});
    } else {
      if (!user) {
        res.send(`${req.body.email} is not registered.`);
      } else {
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if (err) {
            console.log(err);
            res.render('error', {message: 'An error occured logging in that user'});
          }
          if (result == true) {
            req.session.isLoggedIn = true;
            req.session.username = user.username;
            res.redirect('/');
          } else {
            res.render('error', {message: 'Password incorrect, please go back and try again'});
          }
        });
      }
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
      console.log(err);
      res.render('error', {message: 'An error occured finding that user'});
    } else {
      if (!user) {
        res.render('user-not-found');
      } else {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: req.body.email,
          from: 'no-reply@recordshowmania.com',
          subject: 'Password Reset',
          html: `<p>Click the link below to reset your Record Show Mania password:</p> <br>
          <p><a href="https://www.recordshowmania.com/reset/${token}">https://www.recordshowmania.com/reset/${token}</a></p> <br>
          <p>Please do not reply to this email. For assistance, please contuct us at <a href="mailto:help@recordshowmania.com">help@recordshowmania.com</a>`
        };
        sgMail.send(msg);
        res.render('check-email');
      }
    }
  });
}

// display reset password page
exports.display_reset = function(req, res) {
  User.findOne({ reset_password_token: req.params.token }, function(err, user) {
    if (err) {
      console.log(err);
      res.render('error', { message: 'Sorry, a server error occured (Code UC136). '});
    } else {
      if (!user) {
        res.render('user-not-found');
      } else {
        if (user.reset_password_token_expires < Date.now()) {
          res.render('token-expired');
        } else {
          res.render('reset-password', {reset_password_token: req.params.token});
        }
      }
    }
  });
}

// reset password
exports.reset_password = function(req, res) {
  if (req.body.password != req.body.confirm_password) {
    res.render('error', {message: 'Passwords do not match - please go back and try again'});
  } else {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if (err) {
        console.log(err);
        res.render('error', {message: 'An error occured updating password'});
      } else {
        let update = {
          password: hash
        };
        User.findOneAndUpdate({ reset_password_token:  req.body.reset_password_token }, update, function(err, user) {
          req.session.isLoggedIn = true;
          req.session.username = user.username;
          res.redirect('/password-updated');
        });
      }
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
    res.redirect('/session-expired');
  }
}

// logout user
exports.logout_user = function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
      res.render('error', {message: 'An error occured logging out that user'});
    } else {
      res.render('logout', {
        title: 'You have been logged out.'
      });
    }
  });
}

// display session expired page
exports.session_expired = function(req, res) {
  res.render('session-expired', {
    title: 'Session expired.'
  });
}

// display privacy policy
exports.get_privacy_policy = function(req, res) {
  res.render('privacy-policy', {
    title: 'Privacy Policy'
  });
}

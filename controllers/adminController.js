var User = require('../models/user');

exports.show_all_users = function(req, res) {
  if (req.session.isAdmin != true) {
    res.send('You are not authorized to view this page.')
  }

  User.find(function(err, users) {
    if (err) {
      res.render('error', {message: 'An error occured displaying all users.'});
    }
    var usersLength = users.length;
    var usersArray = [];
    for (var i = 0; i < usersLength; i++) {
      var user = {};
      user.username = users[i].username;
      user.email = users[i].email;
      usersArray.push(user);
    }
    res.render('all-users', {
      title: 'All Users',
      users: usersArray,
      usersLength: usersLength
    });
  })
}

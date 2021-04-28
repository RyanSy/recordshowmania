var User = require('../models/user');

exports.show_all_users = function(req, res) {
  if (req.session.isAdmin != true) {
    res.send('You are not authorized to view this page.')
  }

  User.find(function(err, users) {
    if (err) {
      res.render('error', {message: 'An error occured displaying users'});
    }
    var usersArray = [];
    for (var i = 0; i < users.length; i++) {
      var user = {};
      user.username = users[i].username;
      user.email = users[i].email;
      usersArray.push(user);
    }
    console.log(usersArray);
    res.render('all-users', {
      title: 'All Users',
      users: usersArray
    });
  })
}

var Show = require('../models/show');
var moment = require('moment');

/* display shows on index */
exports.list_shows = function(req, res) {
  Show.find(function(err, shows) {
      // remove shows if past
    if (err) {
      console.log(err);
      res.send('An error occured displaying all shows.');
    }

    var showsArray = [];

    for (var i = 0; i < shows.length; i++) {
      var showObject = {
        date: moment(shows[i].date).format('dddd, MMMM Do, YYYY'),
        month: moment(shows[i].date).format('MMM'),
        day: moment(shows[i].date).format('D'),
        day_abbreviated: moment(shows[i].date).format('ddd'),
        name: shows[i].name,
        venue: shows[i].venue,
        address: shows[i].address,
        city: shows[i].city,
        state: shows[i].state,
        zip: shows[i].zip,
        start: shows[i].start,
        end:shows[i].end,
        early_admission: shows[i].early_admission,
        early_admission_time: shows[i].early_admission_time,
        early_admission_fee: shows[i].early_admission_fee,
        number_of_dealers: shows[i].number_of_dealers,
        number_of_tables: shows[i].number_of_tables,
        size_of_tables: shows[i].size_of_tables,
        table_rent: shows[i].table_rent,
        cd_dealers: shows[i].cd_dealers,
        fortyfive_dealers: shows[i].fortyfive_dealers,
        seventyeight_dealers: shows[i].seventyeight_dealers,
        food_drink: shows[i].food_drink,
        handicapped_access: shows[i].handicapped_access,
        more_information: shows[i].more_information,
        posted_by: shows[i].posted_by
      };
      showsArray.push(showObject);
    }

    if (req.session.isLoggedIn == true) {
      res.render('index', {
        title: 'Record Show Mania',
        username: req.session.username,
        isLoggedIn: true,
        shows: showsArray
      });
    } else {
      res.render('index', {
        title: 'Record Show Mania',
        shows: showsArray
      });
    }
  });
};

/* display add show form */
exports.get_add_show = function(req, res) {
  if (req.session.isLoggedIn) {
    res.render('add-show', {
      username: req.session.username,
      isLoggedIn: true
    });
  }
  else {
    res.render('session-expired', {message: 'add a show.'});
  }
};

/* add show */
exports.post_add_show = function(req, res) {
  var show = req.body;
  console.log(show);
  show.posted_by = req.session.username;

  Show.create(show, function(err, newShow) {
    if (err) {
      console.log(err);
      res.send('An error occured creating your show.');
    }
    Show.find({ 'posted_by': req.session.username }, function(err, shows) {
      if (err) {
        console.log(err);
        res.send('An error occured getting your shows.');
      }
      var showsArray = [];
      for (var i = 0; i < shows.length; i++) {
        var showObject = {
          date: moment(shows[i].date).format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: shows[i].start,
          end: shows[i].end,
          regular_admission_fee: shows[i].regular_admission_fee,
          early_admission: shows[i].early_admission,
          early_admission_time: shows[i].early_admission_time,
          early_admission_fee: shows[i].early_admission_fee,
          number_of_dealers: shows[i].number_of_dealers,
          number_of_tables: shows[i].number_of_tables,
          size_of_tables: shows[i].size_of_tables,
          table_rent: shows[i].table_rent,
          cd_dealers: shows[i].cd_dealers,
          fortyfive_dealers: shows[i].fortyfive_dealers,
          seventyeight_dealers: shows[i].seventyeight_dealers,
          food_drink: shows[i].food_drink,
          handicapped_access: shows[i].handicapped_access,
          more_information: shows[i].more_information,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      }
      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: shows,
          message: `"${newShow.name}" successfully added.`,
          message_exists: true
        });
      }
      else {
        res.render('session-expired', { message: 'add a show.' });
      }
    });
  });
};

// search shows
exports.search_shows = function(req, res) {
  Show.find({
    $or: [
      { 'date': req.body.date },
      { 'state': req.body.state }
    ]
  }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured searching for shows.');
    }
    if (shows.length == 0) {
      if (req.session.isLoggedIn == true) {
        res.render('no-results', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: shows
        });
      }
      else {
        res.render('no-results', {
          title: 'Record Show Mania',
        });
      }
    }
    else {
      if (req.session.isLoggedIn == true) {
        res.render('search-results', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: shows
        });
      }
      else {
        res.render('search-results', {
          title: 'Record Show Mania',
          shows: shows
        });
      }
    }
  });
};

// get my shows page
exports.get_my_shows = function(req, res) {
  Show.find({ 'posted_by': req.session.username }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured getting your shows.');
    }
    var showsArray = [];
    for (var i = 0; i < shows.length; i++) {
      var showObject = {
        id: shows[i]._id,
        date: moment(shows[i].date).format('dddd, MMMM Do, YYYY'),
        name: shows[i].name,
        venue: shows[i].venue,
        address: shows[i].address,
        city: shows[i].city,
        state: shows[i].state,
        zip: shows[i].zip,
        start: moment(shows[i].start, 'HH:MM').format('h:mm A'),
        end: moment(shows[i].end, 'HH:MM').format('h:mm A'),
        regular_admission_fee: shows[i].regular_admission_fee,
        early_admission: shows[i].early_admission,
        early_admission_time: shows[i].early_admission_time,
        early_admission_fee: shows[i].early_admission_fee,
        number_of_dealers: shows[i].number_of_dealers,
        number_of_tables: shows[i].number_of_tables,
        size_of_tables: shows[i].size_of_tables,
        table_rent: shows[i].table_rent,
        cd_dealers: shows[i].cd_dealers,
        fortyfive_dealers: shows[i].fortyfive_dealers,
        seventyeight_dealers: shows[i].seventyeight_dealers,
        food_drink: shows[i].food_drink,
        handicapped_access: shows[i].handicapped_access,
        more_information: shows[i].more_information,
        posted_by: shows[i].posted_by
      };
      showsArray.push(showObject);
    }
    var noshow_message;
    if (showsArray.length == 0) {
      noshow_message = 'You have no shows listed.';
    } else {
      noshow_message = null;
    }
    if (req.session.isLoggedIn == true) {
      res.render('my-shows', {
        title: 'Record Show Mania',
        username: req.session.username,
        isLoggedIn: true,
        shows: showsArray,
        noshow_message: noshow_message
      });
    }
    else {
      res.render('session-expired', { message: 'view your shows.'});
    }
  });
};

// get edit show page
exports.get_edit_show = function(req, res) {
  Show.findOne({ '_id': req.params.id }, function(err, show) {
    if (err) {
      console.log(err);
      res.send('An error occured getting that show.');
    }
    if (req.session.isLoggedIn) {
      res.render('edit-show', {
        username: req.session.username,
        isLoggedIn: true,
        show: show
      });
    }
    else {
      res.send('You must be logged in to edit your show.');
    }
  });
};

// edit show
exports.post_edit_show = function(req, res) {
  let update = {
    date: req.body.date,
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
    message: 'Updated successfully.',
    posted_by: req.session.username
  };
  Show.findByIdAndUpdate(req.params.id, update, function(err, updatedShow) {
    if (err) {
      console.log(err);
      res.send('An error occured updating db.');
    }
    // look at this later
    console.log('updatedShow: ', updatedShow);

    Show.find({ 'posted_by': req.session.username }, function(err, shows) {
      if (err) {
        console.log(err);
        res.send('An error occured finding my shows.');
      }
      var showsArray = [];
      for (var i = 0; i < shows.length; i++) {
        var showObject = {
          id: shows[i]._id,
          date: moment(shows[i].date).format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: moment(shows[i].start, 'H:MM').format('h:mm A'),
          end: moment(shows[i].end, 'H:MM').format('h:mm A'),
          admission: shows[i].admission,
          details: shows[i].details,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      }
      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArray,
          message: 'Update successful.',
          message_exists: true
        });
      }
      else {
        res.render('session-expired', { message: 'edit your show.' });
      }
    });
  });
};

// delete show
exports.delete_show = function(req, res) {
  console.log('req.body: ', req.body)
  Show.findByIdAndDelete(req.body.id, function(err) {
    if (err) {
      res.send('An error occured deleting this show.');
    }
    /*
    try this?
    res.render('my-shows', { message: "Show has been deleted successfully." });
    */
    Show.find({ 'posted_by': req.session.username }, function(err, shows) {
      if (err) {
        console.log(err);
        res.send('An error occured finding my shows.');
      }
      var showsArray = [];
      for (var i = 0; i < shows.length; i++) {
        var showObject = {
          id: shows[i]._id,
          date: moment(shows[i].date).format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: moment(shows[i].start, 'H:MM').format('h:mm A'),
          end: moment(shows[i].end, 'H:MM').format('h:mm A'),
          admission: shows[i].admission,
          details: shows[i].details,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      }
      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArray,
          message: 'Show deleted successfully.',
          message_exists: true
        });
      }
      else {
        res.render('session-expired', { message: 'delete your show.' });
      }
    });
  })
};

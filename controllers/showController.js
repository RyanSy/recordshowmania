var Show = require('../models/show');
var moment = require('moment');
var fs = require('fs');
var cloudinary = require('cloudinary');

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
        id: shows[i]._id,
        date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
        month: moment(shows[i].date, 'YYYY-MM-DD').format('MMM'),
        day: moment(shows[i].date, 'YYYY-MM-DD').format('D'),
        day_abbreviated: moment(shows[i].date).format('ddd'),
        name: shows[i].name,
        venue: shows[i].venue,
        address: shows[i].address,
        city: shows[i].city,
        state: shows[i].state,
        zip: shows[i].zip,
        start: moment(shows[i].start, 'HH').format('LT'),
        end: moment(shows[i].end, 'HH').format('LT'),
        date_start: new Date(shows[i].date + ' ' + shows[i].start),
        regular_admission_fee: shows[i].regular_admission_fee,
        early_admission: shows[i].early_admission,
        early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
        contact_name: shows[i].contact_name,
        contact_email: shows[i].contact_email,
        contact_phone: shows[i].contact_phone,
        posted_by: shows[i].posted_by
      };
      showsArray.push(showObject);
    }

    var sortByDateStart = function(showsArray) {
      return showsArray.sort(function(a, b) {
        return new Date(a.date_start) - new Date(b.date_start);
      });
    }

    var showsArraySorted = sortByDateStart(showsArray);

    if (req.session.isLoggedIn == true) {
      res.render('index', {
        title: 'Record Show Mania',
        username: req.session.username,
        isLoggedIn: true,
        shows: showsArraySorted
      });
    } else {
      res.render('index', {
        title: 'Record Show Mania',
        shows: showsArraySorted
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
  show.posted_by = req.session.username;
  show.date_start = new Date(req.body.date + ' ' + req.body.start);
  show.image = req.file.path;

  console.log('req.file: ', req.file);
  //
  // var stream = cloudinary.uploader.upload_stream(function(result) {
  //   console.log(result);
  // }, { public_id: req.body.title } );
  //
  // fs.createReadStream(req.files.image.path, {encoding: 'binary'}).on('data', stream.write).on('end', stream.end);

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
          id: shows[i]._id,
          date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: moment(shows[i].start, 'HH').format('LT'),
          end: moment(shows[i].end, 'HH').format('LT'),
          date_start: new Date(shows[i].date + ' ' + shows[i].start),
          regular_admission_fee: shows[i].regular_admission_fee,
          early_admission: shows[i].early_admission,
          early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
          contact_name: shows[i].contact_name,
          contact_email: shows[i].contact_email,
          contact_phone: shows[i].contact_phone,
          image: shows[i].image,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      }

      var sortByDateStart = function(showsArray) {
        return showsArray.sort(function(a, b) {
          return new Date(a.date_start) - new Date(b.date_start);
        });
      }

      var showsArraySorted = sortByDateStart(showsArray);

      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArraySorted,
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

/* search shows */
exports.search_shows = function(req, res) {
  Show.find({ $or: [{ 'date': req.body.date }, { 'state': req.body.state }] }, function(err, shows) {
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
        });
      }
      else {
        res.render('no-results', {
          title: 'Record Show Mania',
        });
      }
    } else {
        var showsArray = [];

        for (var i = 0; i < shows.length; i++) {
          var showObject = {
            id: shows[i]._id,
            date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
            month: moment(shows[i].date, 'YYYY-MM-DD').format('MMM'),
            day: moment(shows[i].date, 'YYYY-MM-DD').format('D'),
            day_abbreviated: moment(shows[i].date, 'YYYY-MM-DD').format('ddd'),
            name: shows[i].name,
            venue: shows[i].venue,
            address: shows[i].address,
            city: shows[i].city,
            state: shows[i].state,
            zip: shows[i].zip,
            start: moment(shows[i].start, 'HH').format('LT'),
            end: moment(shows[i].end, 'HH').format('LT'),
            date_start: new Date(shows[i].date + ' ' + shows[i].start),
            regular_admission_fee: shows[i].regular_admission_fee,
            early_admission: shows[i].early_admission,
            early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
            contact_name: shows[i].contact_name,
            contact_email: shows[i].contact_email,
            contact_phone: shows[i].contact_phone,
            image: shows[i].image,
            posted_by: shows[i].posted_by
          };
          showsArray.push(showObject);
        }

        var sortByDateStart = function(showsArray) {
          return showsArray.sort(function(a, b) {
            return new Date(a.date_start) - new Date(b.date_start);
          });
        }

        var showsArraySorted = sortByDateStart(showsArray);

        if (req.session.isLoggedIn == true) {
          res.render('search-results', {
            title: 'Record Show Mania',
            username: req.session.username,
            isLoggedIn: true,
            shows: showsArraySorted
          });
        } else {
            res.render('search-results', {
              title: 'Record Show Mania',
              shows: showsArraySorted
          });
      }
    }
  });
};

/* get my shows page */
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
        date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
        name: shows[i].name,
        venue: shows[i].venue,
        address: shows[i].address,
        city: shows[i].city,
        state: shows[i].state,
        zip: shows[i].zip,
        start: moment(shows[i].start, 'HH').format('LT'),
        end: moment(shows[i].end, 'HH').format('LT'),
        date_start: new Date(shows[i].date + ' ' + shows[i].start),
        regular_admission_fee: shows[i].regular_admission_fee,
        early_admission: shows[i].early_admission,
        early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
        contact_name: shows[i].contact_name,
        contact_email: shows[i].contact_email,
        contact_phone: shows[i].contact_phone,
        image: shows[i].image,
        posted_by: shows[i].posted_by
      };
      showsArray.push(showObject);
    }

    var sortByDateStart = function(showsArray) {
      return showsArray.sort(function(a, b) {
        return new Date(a.date_start) - new Date(b.date_start);
      });
    }

    var showsArraySorted = sortByDateStart(showsArray);

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
        shows: showsArraySorted,
        noshow_message: noshow_message
      });
    } else {
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
  var update = req.body;

  update.message = 'Updated successfully.';
  update.image = req.file.path;
  update.posted_by = req.session.username;

  console.log('req.file: ', req.file);

  Show.findByIdAndUpdate(req.params.id, update, function(err, updatedShow) {
    if (err) {
      console.log(err);
      res.send('An error occured updating db.');
    }

    Show.find({ 'posted_by': req.session.username }, function(err, shows) {
      if (err) {
        console.log(err);
        res.send('An error occured finding my shows.');
      }

      var showsArray = [];

      for (var i = 0; i < shows.length; i++) {
        var showObject = {
          id: shows[i]._id,
          date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: moment(shows[i].start, 'HH').format('LT'),
          end: moment(shows[i].end, 'HH').format('LT'),
          date_start: new Date(shows[i].date + ' ' + shows[i].start),
          regular_admission_fee: shows[i].regular_admission_fee,
          early_admission: shows[i].early_admission,
          early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
          contact_name: shows[i].contact_name,
          contact_email: shows[i].contact_email,
          contact_phone: shows[i].contact_phone,
          image: shows[i].image,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      };

      var sortByDateStart = function(showsArray) {
        return showsArray.sort(function(a, b) {
          return new Date(a.date_start) - new Date(b.date_start);
        });
      }

      var showsArraySorted = sortByDateStart(showsArray);

      //  change to redirect?
      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArraySorted,
          message: 'Update successful.',
          message_exists: true
        });
      } else {
        res.render('session-expired', { message: 'edit your show.' });
      }
    });
  });
};

// delete show
exports.delete_show = function(req, res) {
  Show.findByIdAndDelete(req.body.id, function(err) {
    if (err) {
      res.send('An error occured deleting this show.');
    }
    Show.find({ 'posted_by': req.session.username }, function(err, shows) {
      if (err) {
        console.log(err);
        res.send('An error occured finding my shows.');
      }
      var showsArray = [];
      for (var i = 0; i < shows.length; i++) {
        var showObject = {
          id: shows[i]._id,
          date: moment(shows[i].date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
          name: shows[i].name,
          venue: shows[i].venue,
          address: shows[i].address,
          city: shows[i].city,
          state: shows[i].state,
          zip: shows[i].zip,
          start: moment(shows[i].start, 'HH').format('LT'),
          end: moment(shows[i].end, 'HH').format('LT'),
          date_start: new Date(shows[i].date + ' ' + shows[i].start),
          regular_admission_fee: shows[i].regular_admission_fee,
          early_admission: shows[i].early_admission,
          early_admission_time: moment(shows[i].early_admission_time, 'HH').format('LT'),
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
          contact_name: shows[i].contact_name,
          contact_email: shows[i].contact_email,
          contact_phone: shows[i].contact_phone,
          posted_by: shows[i].posted_by
        };
        showsArray.push(showObject);
      }

      var sortByDateStart = function(showsArray) {
        return showsArray.sort(function(a, b) {
          return new Date(a.date_start) - new Date(b.date_start);
        });
      }

      var showsArraySorted = sortByDateStart(showsArray);

      //  change to redirect?
      if (req.session.isLoggedIn == true) {
        res.render('my-shows', {
          title: 'Record Show Mania',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArraySorted,
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

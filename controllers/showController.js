var Show = require('../models/show');
var moment = require('moment');
var async = require('async');
var cloudinary = require('cloudinary').v2;
var path = require('path');
var Datauri = require('datauri');
var dUri = new Datauri();

/* display all shows on index in ascending order */
exports.list_shows = function(req, res) {
  Show.find(function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured displaying all shows.');
    }

    var showsArray = createShowsArray(shows);
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
      isLoggedIn: true,
      dateNow: moment().format('YYYY-MM-DD')
    });
  } else {
    res.render('session-expired', {message: 'add a show.'});
  }
};

/* add show */
exports.post_add_show = function(req, res) {
  console.log('post_add_show route called');
  var show = req.body;
  show.posted_by = req.session.username;
  show.date_start = new Date(req.body.date + ' ' + req.body.start);

  async.waterfall([
    // upload image and get url
    function uploadImage(callback) {
      console.log('uploadImage() called');
      if (req.file) {
        dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        cloudinary.uploader.upload(dUri.content, { width: 400, height: 400, crop: 'limit' }, function (error, result) {
          if (error) {
            console.log(error);
            callback(error, null);
          } else {
            var imageUrl = result.secure_url;
            var imagePublicId = result.public_id;
            callback(null, imageUrl, imagePublicId);
          }
        });
      } else {
        callback(null, null, null);
      }
    },

    // set image url and image public id in show object
    function setShowImage(imageUrl, imagePublicId, callback) {
      console.log('setShowImage() called');
      if (imageUrl) {
        show.image = imageUrl;
        show.image_public_id = imagePublicId;
        callback(null, show);
      } else {
        callback(null, show);
      }
    },

    // add show
    function addShow(show, callback) {
      console.log('addShow() called');
      Show.create(show, function(err, newShow) {
        if (err) {
          console.log(err);
          callback(err, null);
          // res.send('An error occured creating the show (Error code: SC92). Please go back and try again or email help@recordshowmania.com if the problem persists.');
        } else {
          // add future shows, if any
          if (req.body.future_dates) {
            var futureDates = req.body.future_dates;
            console.log(futureDates);
            for (var i = 0; i < futureDates.length; i++) {
              show.date = futureDates[i];
              show.date_start = new Date(futureDates[i] + ' ' + show.start);
              console.log(i + ': ' + show.date_start);
              Show.create(show, function(err, data) {
                if (err) {
                  console.log(err);
                  // callback(err, null);
                  // res.send('An error occured creating the show (Error code: SC106). Please go back and try again or email help@recordshowmania.com if the problem persists.');
                }
              });
            }
          }
          callback(null, newShow);
        }
      });
    },

    // get my shows
    function getAllShows(data, callback) {
      console.log('getAllShows() called');
      Show.find({ 'posted_by': req.session.username }, function(err, shows) {
        if (err) {
          console.log(err);
          callback(err, null);
          // res.send('An error occured (Error code: SC119). Please go back and try again or email help@recordshowmania.com if the problem persists.');
          // return;
        } else {
          var showsArray = createShowsArray(shows);
          var showsArraySorted = sortByDateStart(showsArray);
          callback(null, showsArraySorted);
        }
      });
    }
  ], // end waterfall array

  // waterfall callback
  function(err, showsArraySorted) {
    console.log('waterfall callback called');
    if (req.session.isLoggedIn == true) {
          // res.render('my-shows', {
          //   title: 'Record Show Mania',
          //   username: req.session.username,
          //   isLoggedIn: true,
          //   shows: showsArraySorted,
          //   message: 'Show(s) successfully created.',
          //   message_exists: true
          // });
          res.redirect('/my-shows');
        } else {
          res.render('session-expired', { message: 'edit your show.' });
        }
  }); // end waterfall
}; // end post_add_show

/* search shows */
exports.search_shows = function(req, res) {
  Show.find({ $or: [{ 'date': req.body.date }, { 'state': req.body.state }] }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured (Error code: SC151). Please go back and try again or email help@recordshowmania.com if the problem persists.');
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
        var showsArray = createShowsArray(shows);
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
      res.send('An error occured (Error code: SC193). Please go back and try again or email help@recordshowmania.com if the problem persists.');
    } else {
      var showsArray = createShowsArray(shows);
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
    }
  });
};

/* get edit show page */
exports.get_edit_show = function(req, res) {
  Show.findOne({ '_id': req.params.id }, function(err, show) {
    if (err) {
      console.log(err);
      res.send('An error occured (Error code: SC226). Please go back and try again or email help@recordshowmania.com if the problem persists.');
    } else {
      if (req.session.isLoggedIn) {
        res.render('edit-show', {
          username: req.session.username,
          isLoggedIn: true,
          dateNow: moment().format('YYYY-MM-DD'),
          show: show
        });
      }
      else {
        res.send('You must be logged in to edit your show.');
      }
    }
  });
};

/* edit show */
exports.post_edit_show = function(req, res) {
  var update = req.body;
  update.message = 'Updated successfully.';
  update.posted_by = req.session.username;

  async.waterfall([
    // upload image and get url
    function uploadImage(callback) {
      if (req.file) {
        dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        cloudinary.uploader.upload(dUri.content, function (error, result) {
          if (error) {
            console.log(error);
            callback(error, null);
          }
            var imageUrl = result.secure_url;
            var imagePublicId = result.public_id;
            callback(null, imageUrl, imagePublicId);
        });
      } else {
        callback(null, null, null);
      }
    },

    // set image url and image public id in update object
    function setShowImage(imageUrl, imagePublicId, callback) {
      if (imageUrl) {
        update.image = imageUrl;
        update.image_public_id = imagePublicId;
        callback(null, update);
      } else {
        callback(null, update);
      }
    },

    // update db
    function updateDb(update, callback) {
      Show.findByIdAndUpdate(req.params.id, update, function(err, updatedShow) {
        if (err) {
          console.log(err);
          callback(err, null);
          // res.send('An error occured (Error code: SC285). Please go back and try again or email help@recordshowmania.com if the problem persists.');
          // return;
        } else {
          callback(null, updatedShow);
        }
      });
    },

    // get my shows
    function getAllShows(updatedShow, callback) {
      Show.find({ 'posted_by': req.session.username }, function(err, shows) {
        if (err) {
          console.log(err);
          callback(err, null);
          // res.send('An error occured (Error code: SC298). Please go back and try again or email help@recordshowmania.com if the problem persists.');
          // return;
        } else {
          var showsArray = createShowsArray(shows);
          var showsArraySorted = sortByDateStart(showsArray);
          callback(null, showsArraySorted);
        }
      });
    }
  ],

  // waterfall callback
  function(err, showsArraySorted) {
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
  }); // end waterfall
}; // end post_edit_show

/* delete show */
exports.delete_show = function(req, res) {
  if (req.body.image_public_id) {
    cloudinary.uploader.destroy(req.body.image_public_id, function(error) {
      if (error) {
        console.log(error);
        // res.send('An error occured (Error code: SC331). Please go back and try again or email help@recordshowmania.com if the problem persists.')
      }
    });
  }
  Show.findByIdAndDelete(req.body.id, function(err) {
    if (err) {
      res.send('An error occured (Error code: SC337). Please go back and try again or email help@recordshowmania.com if the problem persists.');
    } else {
      Show.find({ 'posted_by': req.session.username }, function(err, shows) {
        if (err) {
          console.log(err);
          res.send('An error occured (Error code: SC343). Please go back and try again or email help@recordshowmania.com if the problem persists.');
        } else {
          var showsArray = createShowsArray(shows);
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
        }
      });
    }


  })
};

/* helper functions */
function createShowsArray(shows) {
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
      featured_dealers: shows[i].featured_dealers,
      cd_dealers: shows[i].cd_dealers,
      cassette_dealers: shows[i].cassette_dealers,
      fortyfive_dealers: shows[i].fortyfive_dealers,
      seventyeight_dealers: shows[i].seventyeight_dealers,
      food_drink: shows[i].food_drink,
      handicapped_access: shows[i].handicapped_access,
      more_information: shows[i].more_information,
      contact_name: shows[i].contact_name,
      contact_email: shows[i].contact_email,
      contact_phone: shows[i].contact_phone,
      image: shows[i].image,
      image_public_id: shows[i].image_public_id,
      posted_by: shows[i].posted_by
    };
    showsArray.push(showObject);
  };
  return showsArray;
}

function sortByDateStart(showsArray) {
  return showsArray.sort(function(a, b) {
    return new Date(a.date_start) - new Date(b.date_start);
  });
}

var Show = require('../models/show');
var moment = require('moment');
var async = require('async');
var cloudinary = require('cloudinary').v2;
var path = require('path');
var Datauri = require('datauri');
var dUri = new Datauri();
var _ = require('lodash');
var todaysDate = moment().format('YYYY-MM-DD');

/* display all shows on index in ascending order */
exports.list_shows = function(req, res) {
  Show.find({ date: {$gte: todaysDate} }, function(err, shows) {
    if (err) {
      console.log(err);
      res.render('error', {message: 'An error occured displaying shows.'});
    } else {
      var showsArray = createShowsArray(shows);
      var showsArraySorted = sortByDateStart(showsArray);
      if (req.session.isLoggedIn == true) {
        res.render('index', {
          title: 'Record Show Mania - Find Record Shows Near You!',
          meta_content: 'Record show listings all across the USA.',
          username: req.session.username,
          isLoggedIn: true,
          isAdmin: req.session.isAdmin,
          shows: showsArraySorted,
          date: todaysDate.toString()
        });
      } else {
        res.render('index', {
          title: 'Record Show Mania - Find Record Shows Near You!',
          meta_content: 'Record show listings all across the USA.',
          shows: showsArraySorted,
          date: todaysDate.toString()
        });
      }
    }
  });
};

/* display a show details - for non-admin view */
exports.list_show = function(req, res) {
  Show.findOne({ '_id': req.body.id }, function(err, show) {
    if (err) {
      console.log(err);
      res.render('error', {message: 'An error occured displaying this show.'});
    } else {
      var showObject = createShowObject(show);
      if (req.session.isLoggedIn) {
        res.render('show', {
          username: req.session.username,
          isLoggedIn: true,
          title: `${showObject.name} - ${showObject.date}`,
          meta_content: show.more_information,
          show: showObject
        })
      } else {
        res.render('show', {
          title: `${showObject.name} - ${showObject.date}`,
          meta_content: show.more_information,
          show: showObject
        });
      }
    }
  })
}

/* display add show form */
exports.get_add_show = function(req, res) {
  if (req.session.isLoggedIn) {
    // if admin is logged in, search for past shows for autocomplete form feature
    if (req.session.isAdmin) {
      Show.find( {'posted_by': req.session.username}, function(err, shows) {
        var savedShows = [];
        var showsLength = shows.length;
        if (err) {
          console.log(err);
          res.render('error', {message: 'An error occured finding saved shows.'});
        }
        for (var i = 0; i < showsLength; i++) {
          savedShows.push(shows[i]);
        }
        savedShows.sort(function(a, b) {
          var nameA = a.name.toUpperCase();
          var nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        // sort by date - descending order so info is pulled from latest entries
        savedShows.sort((a, b) => b.date_start - a.date_start);

        var savedShowsNoDupes = _.uniqBy(savedShows, 'name');
        res.render('add-show', {
          username: req.session.username,
          isLoggedIn: true,
          isAdmin: req.session.isAdmin,
          savedShows: savedShowsNoDupes,
          savedShowsStrings: JSON.stringify(savedShowsNoDupes),
          dateNow: moment().format('YYYY-MM-DD')
        });
      });
    } /* end if req.session.isAdmin */ else {
      res.render('add-show', {
        username: req.session.username,
        isLoggedIn: true,
        isAdmin: req.session.isAdmin,
        dateNow: moment().format('YYYY-MM-DD')
      });
    }
  } /* end if req.session.isLoggedIn */ else {
    res.redirect('/session-expired');
  }
};

/* add show */
exports.post_add_show = function(req, res) {
  var show = req.body;
  show.posted_by = req.session.username;
  show.date_start = new Date(req.body.date + ' ' + req.body.start);
  show.date_posted = new Date();
  async.waterfall([
    // upload image and get url
    function uploadImage(callback) {
      if (req.file) {
        dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        cloudinary.uploader.upload(dUri.content, { width: 400, height: 400, crop: 'limit' }, function (error, result) {
          if (error) {
            console.log(error);
            callback(error, null, null);
            res.render('error', {message: 'An error occured uploading your image.'});
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
      Show.create(show, function(err, newShow) {
        if (err) {
          console.log(err);
          callback(err, null);
          res.render('error', {message: 'An error occured adding this show.'});
        } else {
          callback(null, newShow);
        }
      });
    },
    // add future shows, if any
    function addNewShow(newShow, callback) {
      let futureShow = (({country, isInternational, name, venue, address, address2, international_address, city, state, zip, start, end, currency, regular_admission_fee, early_admission, early_admission_fee, early_admission_time, number_of_dealers, number_of_tables, size_of_tables, table_rent, featured_dealers, cd_dealers, fortyfive_dealers, memorabilia_dealers, food_drink, handicapped_access, more_information, contact_name, contact_phone, contact_email, website, facebook, image, image_public_id, message, posted_by, date_posted}) => ({country, isInternational, name, venue, address, address2, international_address, city, state, zip, start, end, currency, regular_admission_fee, early_admission, early_admission_fee, early_admission_time, number_of_dealers, number_of_tables, size_of_tables, table_rent, featured_dealers, cd_dealers, fortyfive_dealers, memorabilia_dealers, food_drink, handicapped_access, more_information, contact_name, contact_phone, contact_email, website, facebook, image, image_public_id, message, posted_by, date_posted}))(newShow);
      if (newShow.future_dates) {
        var futureDates = newShow.future_dates;
        // create new show for each future date
        for (var i = 0; i < futureDates.length; i++) {
          futureShow.date = futureDates[i];
          futureShow.date_start = new Date(futureDates[i] + ' ' + newShow.start);
          Show.create(futureShow, function(err, newFutureShow) {
            if (err) {
              console.log(err);
              res.render('error', {message: 'An error occured adding future shows.'});
            } else {
              return;
            }
          });
        }
        callback(null);
      } else {
        callback(null);
      }
    }
  ], // end waterfall array
  // waterfall callback
  function(err) {
    if (err) {
      console.log('waterfall callback error:', err);
    }
    if (req.session.isLoggedIn == true) {
          res.redirect('/my-shows');
        } else {
          res.redirect('/session-expired');
        }
  }); // end waterfall
}; // end post_add_show

/* search shows by date*/
exports.search_shows_by_date = function(req, res) {
  Show.find({ 'date': req.body.date }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured searching shows.');
    }
    if (shows.length == 0) {
      if (req.session.isLoggedIn == true) {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          username: req.session.username,
          isLoggedIn: true,
          date: req.body.date
        });
      }
      else {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          date: req.body.date
        });
      }
    } else {
        var showsArray = createShowsArray(shows);
        var showsArraySorted = sortByDateStart(showsArray);
        var searchTerm = moment(req.body.date).format('dddd, MMMM Do, YYYY');

        if (req.session.isLoggedIn == true) {
          res.render('search-results', {
            title: `Record Show Mania - search results for ${searchTerm}`,
            meta_content: `Search results for ${searchTerm}`,
            username: req.session.username,
            isLoggedIn: true,
            shows: showsArraySorted,
            date: req.body.date
          });
        } else {
            res.render('search-results', {
              title: `Record Show Mania - search results for ${searchTerm}`,
              meta_content: `Search results for ${searchTerm}`,
              shows: showsArraySorted,
              date: req.body.date
          });
      }
    }
  });
};

/** search shows by state */
exports.search_shows_by_state = function(req, res) {
  Show.find({ 'date': {$gte: todaysDate}, 'state': req.body.state }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured searching shows.');
    }
    if (shows.length == 0) {
      if (req.session.isLoggedIn == true) {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          username: req.session.username,
          isLoggedIn: true,
          date: req.body.date
        });
      }
      else {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          date: req.body.date
        });
      }
    } else {
        var showsArray = createShowsArray(shows);
        var showsArraySorted = sortByDateStart(showsArray);
        var searchTerm = req.body.state;

        if (req.session.isLoggedIn == true) {
          res.render('search-results', {
            title: `Record Show Mania - search results for ${searchTerm}`,
            meta_content: `Search results for ${searchTerm}`,
            username: req.session.username,
            isLoggedIn: true,
            shows: showsArraySorted,
            date: req.body.date
          });
        } else {
            res.render('search-results', {
              title: `Record Show Mania - search results for ${searchTerm}`,
              meta_content: `Search results for ${searchTerm}`,
              shows: showsArraySorted,
              date: req.body.date
          });
      }
    }
  });
};

/** search shows by country */
exports.search_shows_by_country = function(req, res) {
  Show.find({ 'date': {$gte: todaysDate}, 'country': req.body.country }, function(err, shows) {
    if (err) {
      console.log(err);
      res.send('An error occured searching shows.');
    }
    if (shows.length == 0) {
      if (req.session.isLoggedIn == true) {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          username: req.session.username,
          isLoggedIn: true,
          date: req.body.date
        });
      }
      else {
        res.render('no-results', {
          title: 'Record Show Mania - No Results',
          meta_content: 'Your search yielded no results.',
          date: req.body.date
        });
      }
    } else {
        var showsArray = createShowsArray(shows);
        var showsArraySorted = sortByDateStart(showsArray);
        var searchTerm = req.body.country;

        if (req.session.isLoggedIn == true) {
          res.render('search-results', {
            title: `Record Show Mania - search results for ${searchTerm}`,
            meta_content: `Search results for ${searchTerm}`,
            username: req.session.username,
            isLoggedIn: true,
            shows: showsArraySorted,
            date: req.body.date
          });
        } else {
            res.render('search-results', {
              title: `Record Show Mania - search results for ${searchTerm}`,
              meta_content: `Search results for ${searchTerm}`,
              shows: showsArraySorted,
              date: req.body.date
          });
      }
    }
  });
};

/* get my shows page */
exports.get_my_shows = function(req, res) {
  Show.find({ 'posted_by': req.session.username, 'date': {$gte: todaysDate} }, function(err, shows) {
    if (err) {
      console.log(err);
      res.render('error', {message: 'An error occured displaying your shows.'});
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
          title: 'Record Show Mania - My Shows',
          meta_content: 'Shows you have listed on this site.',
          username: req.session.username,
          isLoggedIn: true,
          shows: showsArraySorted,
          noshow_message: noshow_message,
          isAdmin: req.session.isAdmin
        });
      } else {
        res.redirect('/session-expired');
      }
    }
  });
};

/* get edit show page */
exports.get_edit_show = function(req, res) {
  Show.findOne({ '_id': req.params.id }, function(err, show) {
    if (err) {
      console.log(err);
      res.render('error', {message: 'An error occured displaying the edit show page.'});
    } else {
      if (req.session.isLoggedIn) {
        res.render('edit-show', {
          username: req.session.username,
          isLoggedIn: true,
          isAdmin: req.session.isAdmin,
          dateNow: moment().format('YYYY-MM-DD'),
          show: show
        });
      } else {
        res.render('session-expired');
      }
    }
  });
};

/* edit show */
exports.post_edit_show = function(req, res) {
  var update = req.body;
  update.isInternational ? update.isInternational = true : update.isInternational = false;
  update.posted_by = req.session.username;
  async.waterfall([
    // upload image and get url
    function uploadImage(callback) {
      if (req.file) {
        dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
        cloudinary.uploader.upload(dUri.content, function (error, result) {
          if (error) {
            console.log(error);
            callback(error, null, null);
            res.render('error', {message: 'An error occured uploading your image.'});
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
      Show.findByIdAndUpdate(req.body.id, update, function(err, updatedShow) {
        if (err) {
          console.log(err);
          callback(err, null);
          res.render('error', {message: 'An error occured updating this show.'});
        } else {
          callback(null, updatedShow);
        }
      });
    }
  ],
  // waterfall callback
  function(err, updatedShow) {
    if (req.session.isLoggedIn == true) {
          res.redirect('/my-shows');
        } else {
          res.redirect('/session-expired');
        }
  }); // end waterfall
}; // end post_edit_show

/* delete show */
exports.delete_show = function(req, res) {
  if (req.body.image_public_id) {
    cloudinary.uploader.destroy(req.body.image_public_id, function(error) {
      if (error) {
        console.log(error);
      }
    });
  }
  Show.findByIdAndDelete(req.body.id, function(err) {
    if (err) {
      res.render('error', {message: 'An error occured deleting that show.'});
    } else {
      if (req.session.isLoggedIn == true) {
        res.redirect('/my-shows');
      } else {
        res.redirect('/session-expired');
      }
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
      year: moment(shows[i].date, 'YYYY-MM-DD').format('YYYY'),
      date_og: shows[i].date,
      name: shows[i].name,
      name_formatted: shows[i].name.toLowerCase().replace(/[\s-@#!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '-'),
      country: shows[i].country,
      isInternational: shows[i].isInternational,
      international_address: shows[i].international_address,
      venue: shows[i].venue,
      address: shows[i].address,
      city: shows[i].city,
      state: shows[i].state,
      zip: shows[i].zip,
      start: moment(shows[i].start, 'HH:mm').format('LT'),
      end: moment(shows[i].end, 'HH:mm').format('LT'),
      date_start: new Date(shows[i].date + ' ' + shows[i].start),
      currency: shows[i].currency,
      regular_admission_fee: shows[i].regular_admission_fee,
      early_admission: shows[i].early_admission,
      early_admission_time: moment(shows[i].early_admission_time, 'HH:mm').format('LT'),
      early_admission_fee: shows[i].early_admission_fee,
      number_of_dealers: shows[i].number_of_dealers,
      number_of_tables: shows[i].number_of_tables,
      size_of_tables: shows[i].size_of_tables,
      table_rent: shows[i].table_rent,
      featured_dealers: shows[i].featured_dealers,
      cd_dealers: shows[i].cd_dealers,
      fortyfive_dealers: shows[i].fortyfive_dealers,
      memorabilia_dealers: shows[i].memorabilia_dealers,
      food_drink: shows[i].food_drink,
      handicapped_access: shows[i].handicapped_access,
      more_information: shows[i].more_information,
      contact_name: shows[i].contact_name,
      contact_phone: shows[i].contact_phone,
      contact_email: shows[i].contact_email,
      website: shows[i].website,
      facebook: shows[i].facebook,
      image: shows[i].image,
      image_public_id: shows[i].image_public_id,
      posted_by: shows[i].posted_by,
      dealer_rsvp_list: shows[i].dealer_rsvp_list,
      rsvp: shows[i].rsvp,
      number_of_tables_for_rent: shows[i].number_of_tables_for_rent,
      max_tables_per_dealer: shows[i].max_tables_per_dealer,
      dealer_information: shows[i].dealer_information
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

function createShowObject(show) {
  var showObject = {
    id: show._id,
    date: moment(show.date, 'YYYY-MM-DD').format('dddd, MMMM Do, YYYY'),
    date_og: show.date,
    name: show.name,
    name_formatted: show.name.toLowerCase().replace(/[\s-@#!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '-'),
    isInternational: show.isInternational,
    international_address: show.international_address,
    venue: show.venue,
    address: show.address,
    city: show.city,
    state: show.state,
    zip: show.zip,
    start: moment(show.start, 'HH:mm').format('LT'),
    end: moment(show.end, 'HH:mm').format('LT'),
    currency: show.currency,
    regular_admission_fee: show.regular_admission_fee,
    early_admission: show.early_admission,
    early_admission_time: moment(show.early_admission_time, 'HH').format('LT'),
    early_admission_fee: show.early_admission_fee,
    number_of_dealers: show.number_of_dealers,
    number_of_tables: show.number_of_tables,
    size_of_tables: show.size_of_tables,
    table_rent: show.table_rent,
    featured_dealers: show.featured_dealers,
    cd_dealers: show.cd_dealers,
    fortyfive_dealers: show.fortyfive_dealers,
    memorabilia_dealers: show.memorabilia_dealers,
    food_drink: show.food_drink,
    handicapped_access: show.handicapped_access,
    more_information: show.more_information,
    contact_name: show.contact_name,
    contact_phone: show.contact_phone,
    contact_email: show.contact_email,
    website: show.website,
    facebook: show.facebook,
    image: show.image,
    image_public_id: show.image_public_id,
    posted_by: show.posted_by
  };

  return showObject;
}

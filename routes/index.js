var express = require('express');
var router = express.Router();
var show_controller = require('../controllers/showController');
var user_controller = require('../controllers/userController');

/* GET home page. */
router.get('/', show_controller.list_shows);

// get user registration page
router.get('/register', user_controller.display_registration);

// user registration
router.post('/register', user_controller.register_user);

// get login page
router.get('/login', user_controller.display_login);

// user login
router.post('/login', user_controller.login_user);

// user logout
router.get('/logout', user_controller.logout_user);

// get forgot password page
router.get('/forgot', user_controller.display_forgot);

// send reset password email 
router.post('/forgot', user_controller.send_reset);

// reset password

// get add show page
router.get('/add-show', show_controller.get_add_show);

// add show
router.post('/add-show', show_controller.post_add_show);

// search shows
router.post('/search', show_controller.search_shows);

// get my shows
router.get('/my-shows', show_controller.get_my_shows);

// get edit shows page
router.get('/edit-show/:id', show_controller.get_edit_show);

// edit show
router.post('/edit-show/:id', show_controller.post_edit_show);

// delete show
router.post('/delete-show', show_controller.delete_show);

module.exports = router;

var express = require('express');
var router = express.Router();
var show_controller = require('../controllers/showController');
var user_controller = require('../controllers/userController');
var admin_controller = require('../controllers/adminController');
var path = require('path');
var multer = require('multer');
var memoryStorage = multer.memoryStorage({
  storage: memoryStorage,
  limits: {fileSize: 50000, files: 1}
});
var upload = multer({memoryStorage}).single('image');

// display home page
router.get('/', show_controller.list_shows);

// display show page
router.post('/:name/:date', show_controller.list_show);

// display user registration page
router.get('/register', user_controller.display_registration);

// register user
router.post('/register', user_controller.register_user);

// display login page
router.get('/login', user_controller.display_login);

// login user
router.post('/login', user_controller.login_user);

// logout user
router.get('/logout', user_controller.logout_user);

// display forgot password page
router.get('/forgot', user_controller.display_forgot);

// send reset password email
router.post('/forgot', user_controller.send_reset);

// display reset password page
router.get('/reset/:token', user_controller.display_reset);

// reset password
router.post('/reset', user_controller.reset_password);

// display password updated confirmation page
router.get('/password-updated', user_controller.password_updated);

// display password updated confirmation page
router.get('/session-expired', user_controller.session_expired);

// get add show page
router.get('/add-show', show_controller.get_add_show);

// add show
router.post('/add-show', upload, show_controller.post_add_show);

// search shows by date
router.post('/search-shows-by-date', show_controller.search_shows_by_date);

// search shows by state
router.post('/search-shows-by-state', show_controller.search_shows_by_state);

// search shows by country
router.post('/search-shows-by-country', show_controller.search_shows_by_country);

// get my shows
router.get('/my-shows', show_controller.get_my_shows);

// get edit shows page
router.get('/edit-show/:id', show_controller.get_edit_show);

// edit show
router.post('/edit-show', upload, show_controller.post_edit_show);

// delete show
router.post('/delete-show', show_controller.delete_show);

// show privacy policy
router.get('/privacy-policy', user_controller.get_privacy_policy);

// show terms and conditions
router.get('/terms-conditions', user_controller.get_terms_and_conditions);

// show all users
router.get('/all-users', admin_controller.show_all_users);

module.exports = router;

var express = require('express');
var router = express.Router();
var show_controller = require('../controllers/showController');
var user_controller = require('../controllers/userController');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

// display home page
router.get('/', show_controller.list_shows);

// display user registration page
router.get('/register', user_controller.display_registration);

// regiser user
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

// get add show page
router.get('/add-show', show_controller.get_add_show);

// add show
router.post('/add-show', upload.single('image'), show_controller.post_add_show);

// search shows
router.post('/search', show_controller.search_shows);

// get my shows
router.get('/my-shows', show_controller.get_my_shows);

// get edit shows page
router.get('/edit-show/:id', show_controller.get_edit_show);

// edit show
router.post('/edit-show/:id', upload.single('image'), show_controller.post_edit_show);

// delete show
router.post('/delete-show', show_controller.delete_show);

module.exports = router;

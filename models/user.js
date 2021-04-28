var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    username: {type: String, unique: true, required: true, max: 100},
    email: {type: String, required: true, max: 100},
    password: {type: String, required: true, max: 100},
    reset_password_token: {type: String},
    reset_password_token_expires: {type: String},
    isAdmin: {type: Boolean}
  }
);

module.exports = mongoose.model('User', userSchema);

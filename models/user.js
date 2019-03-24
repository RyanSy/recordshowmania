var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    email: {type: String, required: true, max: 100},
    password: {type: String, required: true, max: 100},
  }
);

module.exports = mongoose.model('User', UserSchema);

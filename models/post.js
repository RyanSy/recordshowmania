var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    date: {type: Date, required: true},
    name: {type: String, required: true, max: 100},
    venue: {type: String, required: true, max: 100},
    hours: {type: String, required: true, max: 100},
    admission: {type: String, required: true, max: 100},
    comments: {type: String, required: true, max: 100},
  }
);

module.exports = mongoose.model('Post', PostSchema);

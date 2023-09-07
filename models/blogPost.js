var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var blogPostShcema = new Schema(
  {
    title: {type: String, required: true, max: 100},
    content: {type: String, required: true},
    image: {type: String, max: 100},
    image_public_id: {type: String, max: 100},
    author: {type: String, required: true, max: 100},
    date_posted: {type: String},
    date_updated: {type: String}
  }
);

module.exports = mongoose.model('blogPost', blogPostShcema);

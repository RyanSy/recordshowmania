var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var showSchema = new Schema(
  {
    date: {type: String},
    name: {type: String, required: true, max: 50},
    venue: {type: String, required: true, max: 50},
    address: {type: String, required: true, max: 100},
    city: {type: String, required: true, max: 75},
    state: {type: String, required: true, max: 2},
    zip: {type: String, required: true, max: 10},
    start: {type: String, required: true, max: 50},
    end: {type: String, required: true, max: 50},
    admission: {type: String, required: true, max: 25},
    details: {type: String, required: true, max: 100},
    message: {type: String, max: 100},
    posted_by: {type: String, required: true, max: 100}
  }
);

module.exports = mongoose.model('Show', showSchema);

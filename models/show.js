var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var showSchema = new Schema(
  {
    date: {type: String, required: true},
    future_dates: [{type: String}],
    name: {type: String, required: true, max: 50},
    venue: {type: String, required: true, max: 50},
    address: {type: String, required: true, max: 100},
    city: {type: String, required: true, max: 75},
    state: {type: String, required: true, max: 2},
    zip: {type: String, required: true, max: 10},
    start: {type: String, required: true, max: 50},
    end: {type: String, required: true, max: 50},
    date_start: {type: Date, required: true},
    regular_admission_fee: {type: String},
    early_admission: {type: Boolean},
    early_admission_fee: {type: String},
    early_admission_time: {type: String},
    number_of_dealers: {type: String},
    number_of_tables: {type: String},
    size_of_tables: {type: String, max: 50},
    table_rent: {type: String},
    featured_dealers: [{type: String}],
    cd_dealers: {type: Boolean},
    cassette_dealers: {type: Boolean},
    fortyfive_dealers: {type: Boolean},
    seventyeight_dealers: {type: Boolean},
    food_drink: {type: Boolean},
    handicapped_access: {type: Boolean},
    more_information: {type: String, max: 100},
    contact_name: {type: String, max: 100},
    contact_email: {type: String, max: 100},
    contact_phone: {type: String, max: 100},
    image: {type: String, max: 100},
    image_public_id: {type: String, max: 100},
    message: {type: String, max: 100},
    posted_by: {type: String, required: true, max: 100}
  }
);

module.exports = mongoose.model('Show', showSchema);

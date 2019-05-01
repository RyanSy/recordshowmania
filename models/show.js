var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/* 
Steve's show inputs:
Date
State
Name Of Show
Venue/Address
Show Hours
Regular Admission/Time
Early Admission/Time
Number Of Dealers
Number Of Tables
Size Of Tables
Table Rent
CD Dealers?
45 Dealers?
78 Dealers?
Food/Drink?
Handicapped Access?
More Information
*/

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
    regular_admission_fee: {type: String, required: true},
    early_admission: {type: Boolean, required: true},
    early_admission_fee: {type: String},
    early_admission_time: {type: String},
    number_of_dealers: {type: String},
    number_of_tables: {type: String},
    size_of_tables: {type: String, max: 50},
    table_rent: {type: String},
    cd_dealers: {type: Boolean, required: true},
    fortyfive_dealers: {type: Boolean, required: true},
    seventyeight_dealers: {type: Boolean, required: true},
    food_drink: {type: Boolean, required: true},
    handicapped_access: {type: Boolean, required: true},
    more_information: {type: String, required: true, max: 100},
    message: {type: String, max: 100},
    posted_by: {type: String, required: true, max: 100}
  }
);

module.exports = mongoose.model('Show', showSchema);

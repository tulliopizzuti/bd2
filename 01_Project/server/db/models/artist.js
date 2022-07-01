const mongoose = require('mongoose');

var schema = new mongoose.Schema({
   id : String,
   followers : Number,
    genres : Array,
    name : String,
    popularity: Number
})


const artistDb = mongoose.model('artists', schema);

module.exports = artistDb;
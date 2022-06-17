const mongoose = require('mongoose');

var schema = new mongoose.Schema({
   id : String,
   followers : String,
    genres : Array,
    name : String,
    popularity: String
})

schema.index({name: 'text'});

const artistDb = mongoose.model('artists', schema);

module.exports = artistDb;
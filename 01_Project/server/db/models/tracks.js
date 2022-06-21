const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id : String,
    name : String,
    popularity: String,
    duration_ms: String,
    explicit: String,
    artists: Array,
    id_artists: Array,
    release_date: String,
    danceability: String,
    energy: String,
    key: String,
    loudness: String,
    mode: String,
    speechiness: String,
    acousticness: String,
    instrumentalness: String,
    liveness: String,
    valence: String,
    tempo: String,
    time_signature: String
})

schema.index({id_artists : 'text'});

const tracksDb = mongoose.model('tracks', schema);

module.exports = tracksDb;
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id : String,
    name : String,
    popularity: Number,
    duration_ms: Number,
    explicit: Number,
    artists: Array,
    id_artists: Array,
    release_date: Date,
    danceability: Number,
    energy: Number,
    key: Number,
    loudness: Number,
    mode: Number,
    speechiness: Number,
    acousticness: Number,
    instrumentalness: Number,
    liveness: Number,
    valence: Number,
    tempo: Number,
    time_signature: Number
})



const tracksDb = mongoose.model('tracks', schema);

module.exports = tracksDb;
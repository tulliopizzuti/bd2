var express = require('express');
var artists_controller=require("../controllers/artists_controller")
var tracks_controller=require("../controllers/tracks_controller")
var router = express.Router();


router.get('/artists',artists_controller.findArtists);
router.get('/tracks',tracks_controller.findTracks);

module.exports = router;
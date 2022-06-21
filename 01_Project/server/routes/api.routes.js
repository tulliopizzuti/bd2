var express = require('express');
var artists_controller=require("../controllers/artists_controller")
var tracks_controller=require("../controllers/tracks_controller")
var router = express.Router();


router.get('/artists',artists_controller.findArtists);
router.get('/artists/group/:fieldname/:nclass',artists_controller.groupArtists);

router.get('/tracks',tracks_controller.findTracks);
router.get('/tracks/artist/:id',tracks_controller.findByArtistId);
router.get('/tracks/artist/group/year/:id',tracks_controller.countTracksByYears);
router.get('/tracks/popularity/avg/year/:id',tracks_controller.avgPopularityByYear);

module.exports = router;
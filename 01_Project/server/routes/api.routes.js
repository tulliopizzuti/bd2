var express = require('express');
var artists_controller=require("../controllers/artists_controller")
var tracks_controller=require("../controllers/tracks_controller")
var router = express.Router();


router.get('/artists',artists_controller.findArtists);
router.get('/artists/tracks',artists_controller.lookupArtistsTracks);
router.get('/artists/group/:fieldname/:nclass',artists_controller.groupArtists);
router.get('/artists/genres',artists_controller.listaGeneri);
router.get('/artists/genres/group/:genre',artists_controller.groupArtistsGenres);

router.get('/genres/tracks',artists_controller.lookupGenresTracks);
router.get('/lookup',artists_controller.lookup);
router.get('/duplicate/artists',artists_controller.duplicates);
router.get('/duplicate/tracks',tracks_controller.duplicates);


router.get('/tracks',tracks_controller.findTracks);
router.get('/tracks/artist/:id',tracks_controller.findByArtistId);
router.get('/tracks/artist/group/year/:id',tracks_controller.countTracksByYears);
router.get('/tracks/popularity/avg/year/:id',tracks_controller.avgPopularityByYear);
router.get('/tracks/popularity/:id',tracks_controller.popularityTracksChart);
router.get('/tracks/group/:fieldname/:nclass',tracks_controller.groupTracks);

module.exports = router;

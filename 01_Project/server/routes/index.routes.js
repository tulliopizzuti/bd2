var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/',function(req,res){
  res.render("pages/index");
});
router.get('/index',function(req,res){
  res.render("pages/index");
});
router.get('/popularity',function(req,res){
  res.render("pages/popularity");
});
router.get('/tracks',function(req,res){
  res.render("pages/tracks");
});
router.get('/genres',function(req,res){
  res.render("pages/genres");
});
router.get('/compare_genres',function(req,res){
  res.render("pages/compare_genres");
});
router.get('/compare_artists',function(req,res){
  res.render("pages/compare_artists");
});
router.get('/duplicates',function(req,res){
  res.render("pages/duplicates");
});
router.get('/lookup',function(req,res){
  res.render("pages/lookup");
});
module.exports = router;
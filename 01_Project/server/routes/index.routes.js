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
router.get('/genres',function(req,res){
  res.render("pages/genres");
});
router.get('/compare_genres',function(req,res){
  res.render("pages/compare_genres");
});
router.get('/compare_artists',function(req,res){
  res.render("pages/compare_artists");
});
module.exports = router;
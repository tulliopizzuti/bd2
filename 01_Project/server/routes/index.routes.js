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

module.exports = router;
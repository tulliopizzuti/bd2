var express = require('express');
var router = express.Router();
var artists_controller=require("../controllers/artists_controller")


router.get('/:id',async function(req,res){
	var id=req.params.id;
	var artist=await artists_controller.artistDetails(id);
	res.render("pages/artist",{
		artist:artist.data[0]
	});
});

module.exports = router;
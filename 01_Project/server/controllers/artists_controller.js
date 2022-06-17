const { name } = require("ejs");
const { response } = require("express");
const artistDb = require("../db/models/artist");
const util = require("../util/util");

exports.findArtists = async function(req,res){
	console.log(req);
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var artists=[];
	artists=artistDb.find(util.createFilterString(fieldName,value));	
	var count= await countArtists(fieldName,value);
	if(sortField && typeSort){		
		artists.sort({[sortField]: typeSort});
	}
	if(skip){
		artists.skip(skip);
	}
	if(limit){
		artists.limit(limit);
	}
	artists.allowDiskUse(true).exec(function(err,result){
		if(err) throw err;
		if(result){
			res.json(
			{
				recordsTotal: count,
				recordsFiltered: count,
				data:result
			});
		}
		else {
			res.json(JSON.stringify({
				error : 'Error'
			}));
		}
	});
}


async function countArtists(fieldName,value){
	artists=artistDb.count(util.createFilterString(fieldName,value));
	return artists.exec();
}
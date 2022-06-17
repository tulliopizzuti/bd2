const { name } = require("ejs");
const { response } = require("express");
const trackDb = require ("../db/models/tracks");
const util = require("../util/util");

exports.findTracks = async function(req,res){
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var tracks=[];
	tracks=trackDb.find(util.createFilterString(fieldName,value));	
	var count= await countTracks(fieldName,value);
	if(sortField && typeSort){		
		tracks.sort({[sortField]: typeSort});
	}
	if(skip){
		tracks.skip(skip);
	}
	if(limit){
		tracks.limit(limit);
	}
	tracks.allowDiskUse(true).exec(function(err,result){
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


async function countTracks(fieldName,value){
	tracks=trackDb.count(util.createFilterString(fieldName,value));
	return tracks.exec();
}
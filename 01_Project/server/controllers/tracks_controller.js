const { name } = require("ejs");
const { response } = require("express");
const trackDb = require ("../db/models/tracks");
const util = require("../util/util");
const commonController = require("./common_controller");

exports.findTracks = async function(req,res){
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var tracks=await commonController.find(trackDb,[{fieldName:fieldName,value:value}],sortField,typeSort,limit,skip);	
	res.json(tracks);	
}

exports.findByArtistId = async function(req,res){
	var id=req.params.id;
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var feat=req.query.feat;
	var conditionFeat="1==1";
	if(feat==="solo"){
		conditionFeat="this.id_artists.length==1";
	}
	else if(feat==="featuring"){
		conditionFeat="this.id_artists.length>1";

	}
	else{
		
	}

	var tracks=await commonController.find(trackDb,
		[
		{fieldName:"id_artists",value:id},
		{fieldName:fieldName,value:value},
		{fieldName:"$where",value:conditionFeat,custom:true}
		],sortField,typeSort,limit,skip);	
	res.json(tracks);
}

exports.countTracksByYears = async function(req,res){
	var id=req.params.id;
	var groupId={ year: { $year: "$release_date" } };
	if(req.query.month){
		groupId={ year: { $year: "$release_date" }, month: { $month: "$release_date" } };
	}
	var tracks=await trackDb.aggregate()
	.match({ id_artists: id})
	.group({_id: groupId,total:{$sum:1} })
	.sort({_id:-1})
	.exec();
	var count=await commonController.count(trackDb,[{fieldName:"id_artists",value:id}]);	
	var chartLabels=tracks.map((x)=> x._id).map((x)=>{
		var s=[];
		for (const [key, value] of Object.entries(x)) {
			s.push(value);
		}
		return s.join('/');
	});
	var data=tracks.map((x)=> x.total);
	var colors=util.getNColors(chartLabels.length);
	res.json({
		labels:chartLabels,
		datasets:[
		{
			label:"Canzoni prodotto anno"+(req.query.month?"/mese":""),
			data:data,
			backgroundColor:colors
		}]
	});
}

exports.avgPopularityByYear = async function(req,res){
	var id=req.params.id;
	var groupId={ year: { $year: "$release_date" } };
	if(req.query.month){
		groupId={ year: { $year: "$release_date" }, month: { $month: "$release_date" } };
	}
	var tracks=await trackDb.aggregate()
	.match({ id_artists: id})
	.group({_id: groupId,avg:{$avg:{$sum:'$popularity'}}})
	.sort({_id:-1})
	.exec();
	var count=await commonController.count(trackDb,[{fieldName:"id_artists",value:id}]);	
	var chartLabels=tracks.map((x)=> x._id).map((x)=>{
		var s=[];
		for (const [key, value] of Object.entries(x)) {
			s.push(value);
		}
		return s.join('/');
	});
	var data=tracks.map((x)=> x.avg);
	var colors=util.getNColors(chartLabels.length);
	res.json({
		labels:chartLabels,
		datasets:[
		{
			label:"Media popolarità canzoni anno"+(req.query.month?"/mese":""),
			data:data,
			backgroundColor:colors
		}]
	});
}



exports.popularityTracksChart = async function(req,res){
	var id=req.params.id;
	var minDate=req.query.min;
	var maxDate=req.query.max;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var conditionDate;
	if(minDate && maxDate){
		conditionDate={$gte:new Date(minDate),$lte:new Date(maxDate)}
	}
	else if(minDate && !maxDate){
		conditionDate={$gte:new Date(minDate)}
	}
	else if(maxDate && !minDate){
		conditionDate={$lte:new Date(maxDate)}
	}
	else{

	}
console.log(conditionDate);
	if(!sortField){
		sortField="release_date";
	}
	if(!typeSort){
		typeSort=1;
	}
	var conds=[{fieldName:"id_artists",value:id}];
	if(conditionDate){
		conds.push({fieldName:"release_date",value:conditionDate,custom:true});
	}
	var tracks=await commonController.find(trackDb,conds,sortField,typeSort);	
	res.json({
		labels:tracks.data.map((x)=>util.formatDate(x.release_date,'yyyy/MM/DD')),
		datasets: [{
			label: 'Andamento popolarità tracce',
			data: tracks.data.map((x)=>x.popularity),
			fill: false,
			borderColor: util.getNColors(1)[0]
		}]
	});
}


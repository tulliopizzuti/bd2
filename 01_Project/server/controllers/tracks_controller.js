const { name } = require("ejs");
const { response } = require("express");
const trackDb = require ("../db/models/tracks");
const util = require("../util/util");
const commonController = require("./common_controller");




exports.duplicates = async function(req,res){
	var fields=req.query.fields;
	var name=req.query.name;

	if(!fields || !Array.isArray(fields)){
		res.json({
			error : 'Passing fields array'
		});
		return;
	}
	res.json(await commonController.duplicates(trackDb,fields,name));


}


exports.findTracks = async function(req,res){
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var one=req.query.one;
	var tracks=await commonController.find(trackDb,[{fieldName:fieldName,value:value}],sortField,typeSort,limit,skip);
	if(one){
		var toRet={};
		if(tracks.data.length>0){
			toRet= tracks.data[0];
		}		
		res.json(toRet);	
	}
	else{
		res.json(tracks);	

	}


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
	var minDate=req.query.min;
	var maxDate=req.query.max;
	var conditionFeat="1==1";
	if(feat==="solo"){
		conditionFeat="this.id_artists.length==1";
	}
	else if(feat==="featuring"){
		conditionFeat="this.id_artists.length>1";

	}
	else{
		
	}
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
	var conds=[
	{fieldName:"id_artists",value:id},
	{fieldName:fieldName,value:value},
	{fieldName:"$where",value:conditionFeat,custom:true}
	];
	if(conditionDate){
		conds.push({fieldName:"release_date",value:conditionDate,custom:true});
	}

	var tracks=await commonController.find(trackDb,
		conds,sortField,typeSort,limit,skip);	
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


exports.groupTracks = async function(req,res){
	var fieldName = req.params.fieldname;
	var classParam = req.params.nclass;
	classParam=parseInt(classParam);
	if(!Number.isInteger(classParam)){
		res.json({
			error : 'N class must be integer value'
		});
		return;
	}
	var min=await commonController.findMinOrMax(trackDb,fieldName,false,true);
	var max=await commonController.findMinOrMax(trackDb,fieldName);
	var l=max-min;
	var b=Array(classParam).fill().map((x,i)=>(parseInt((i+1)*(l/classParam))));
	b[classParam-1]=b[classParam-1]+1;
	var artists=trackDb.aggregate().facet({
		[fieldName]:[{
			$bucket: { 
				groupBy: "$"+fieldName, 
				boundaries: b,
				default:0
			}
		}]
	})
	artists.allowDiskUse(true).exec(function(err,result){
		if(err) throw err;
		if(result){
			var labels=[];
			var last=0;
			for(var i=0;i<b.length;i++){
				labels.push(last+"-"+(b[i]-1));
				last=b[i];
			}
			var title=fieldName;
			var data=result[0][fieldName].map((x,i)=>x.count);

			res.json({
				labels:labels,
				datasets:[
				{
					label:title,
					data:data,
					backgroundColor:util.getNColors(data.length)
				}]
				
			});
		}
		else {
			res.json({
				error : 'Error'
			});
		}
	});
}
const { name } = require("ejs");
const { response } = require("express");
const artistDb = require("../db/models/artist");
const util = require("../util/util");
const commonController = require("./common_controller");

exports.groupArtists = async function(req,res){
	var fieldName = req.params.fieldname;
	var classParam = req.params.nclass;
	classParam=parseInt(classParam);
	if(!Number.isInteger(classParam)){
		res.json({
			error : 'N class must be integer value'
		});
		return;
	}
	var min=await commonController.findMinOrMax(artistDb,fieldName,false,true);
	var max=await commonController.findMinOrMax(artistDb,fieldName);
	var l=max-min;
	var b=Array(classParam).fill().map((x,i)=>(parseInt((i+1)*(l/classParam))));
	b[classParam-1]=b[classParam-1]+1;
	var artists=artistDb.aggregate().facet({
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



exports.groupArtistsGenres=async function(req,res){
	var genre = req.params.genre;
	var min = req.query.min;
	var max = req.query.max;
	min=parseInt(min);
	max=parseInt(max);
	if(genre){
		genre=genre.replace("+",' ');
	}
	else{
		res.json({
			error : 'Error'
		});
		return;
	}
	var q=artistDb.aggregate();
	q.match({genres:genre});
	if(min || max){
		q.project({
			arraySize:{$size:"$genres"},
			genres:1
		});
		if(min && max){
			q.match({
				arraySize:{$gte:min,$lte:max}
			});
		}else if(min && !max){
			q.match({
				arraySize:{$gte:min}
			});
		}else if(!min && max){
			q.match({
				arraySize:{$lte:max}
			});
		}
		else{

		}
	}

	q.group({
		_id: "$genres",
		count:{$sum:1}
	});
	q.sort({"count":-1});
	q.project({
		_id:{
			$reduce: {
				input: "$_id",
				initialValue: "",
				in: {$concat: ["$$value", "$$this",", "]}
			}
		},
		count:"$count"
	});
	q.project({
		_id:{
			$substr:[
			"$_id",
			0,
			{$subtract:[{$strLenCP:'$_id'},2]}
			]
		},
		count:"$count"
	});
	q.allowDiskUse(true).exec(function(err,result){
		if(err) throw err;
		if(result){
			res.json({
				labels:result.map((x)=>x._id),
				datasets:[
				{
					label: 'My First Dataset',
					data: result.map((x)=>x.count),
					backgroundColor: util.getNColors(result.length)
				}
				]
			});			
		}
		else {
			res.json({
				error : 'Error'
			});
		}
	});
}

exports.findArtists = async function(req,res){
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var genres=req.query.genres;
	var conds=[];
	if(fieldName && value){
		conds.push({fieldName:fieldName,value:value});
	}
	if(genres){
		conds.push({
			fieldName:"genres",value:genres,custom:true
		});
	}
	var artists=await commonController.find(artistDb,conds,sortField,typeSort,limit,skip);	
	res.json(artists);	
}



exports.artistDetails = async function(id){
	var res=await commonController.find(artistDb,[{fieldName:"id",value:id}],"id",1,1,0);	
	return res;
}


exports.listaGeneri = async function(req,res){
	var valueSearch = req.query.value;
	var countNull = req.query.countNull;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var graph=req.query.graph;

	var q;
	var cq;
	q=initQListaGeneri(q,valueSearch,countNull);
	cq=initQListaGeneri(cq,valueSearch,countNull);
	var c=await cq.count('res').exec();
	if(sortField && typeSort){		
		q.sort({[sortField]: parseInt(typeSort)});
	}
	if(skip){
		q.skip(parseInt(skip));
	}
	if(limit){
		q.limit(parseInt(limit));
	}
	var resultCount=0;
	try{
		resultCount=c[0].res;
	}catch(e){}
	q.allowDiskUse(true).exec(function(err,result){
		if(err) throw err;
		if(result){
			if(graph){
				res.json({
					data:result,
					backgroundColorBar:util.getNColors(result.length,"80"),
					backgroundColorLine:util.getNColors(2,"",result.length),
				});
			}else{
				res.json({
					recordsTotal: resultCount,
					recordsFiltered: resultCount,
					data:result
				});
			}
			
		}
		else {
			res.json({
				error : 'Error'
			});
		}
	});
}
function initQListaGeneri(q,valueSearch,countNull){
	q=artistDb.aggregate();
	q.unwind({ path: '$genres', preserveNullAndEmptyArrays: (countNull==="true"?true:false) })
	.group({ _id: {$ifNull:["$genres","Unspecified"]} ,count:{$sum:1},med:{$avg:'$popularity'},followers:{$sum:"$followers" }});
	if(valueSearch){
		q.match({_id:{ $regex: '.*' + valueSearch + '.*', '$options' : 'i'  }})
	}
	return q;
}


const { name } = require("ejs");
const { response } = require("express");
const artistDb = require("../db/models/artist");
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
	res.json(await commonController.duplicates(artistDb,fields,name));


}

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




exports.lookup = async function(req,res){
	var startDate=new Date();
	var artist = req.query.artist;
	var track = req.query.track;
	var limit = req.query.limit;
	var sort = req.query.sort;

	if(!limit){
		limit=10;
	}else{
		limit=parseInt(limit);
	}
	if(!sort){
		sort=-1;
	}else{
		sort=parseInt(sort);
	}
	var q=artistDb.aggregate();
	q.allowDiskUse(true);
	q.sort({id:1});
	if(artist){
		q.match({
			name:{ $regex: '.*' + artist + '.*', '$options' : 'i'  }
		});
	}
	q.lookup({
		from: 'tracks',
		localField: 'id',
		foreignField: 'id_artists',
		as: 'tracks'
	});
	if(!track){
		q.project({
			tracks:1,
			name:1,
			tracks_size:{$size:'$tracks'}
		});
		q.project({
			_id:0,
			name:1,
			tracks_size:1
		});
	}
	else{
		q.unwind({path:"$tracks"});
		q.match({
			"tracks.name":{ $regex: '.*'+track+'.*', '$options' : 'i'  }
		});
		q.group({_id:"$name",tracks_size:{$sum:1}});
		q.project({_id:0,tracks_size:1,name:"$_id"});
	}






	q.sort({tracks_size:sort});
	q.limit(limit);
	q.allowDiskUse(true).exec(function(err,result){
		if(err) throw err;
		if(result){
			res.json({
				startDate:startDate,endDate:new Date(),
				data:result});
			
		}
		else {
			res.json({
				error : 'Error'
			});
		}
	});
	
}



exports.lookupArtistsTracks = async function(req,res){
	var idQ=req.query.id;
	var ids=[];
	if(!Array.isArray(idQ)){
		ids.push(idQ);
	}
	else{
		ids=idQ;
	}
	var toRet=[];
	for(var i=0;i<ids.length;i++){
		var id=ids[i];
		var q=artistDb.aggregate();
		q.allowDiskUse(true);
		q.match({id:id});
		q.lookup({
			from: 'tracks',
			localField: 'id',
			foreignField: 'id_artists',
			as: 'tracks'
		});
		q.unwind('tracks');
		q.replaceRoot("tracks");
		q.group({
			_id: null,
			avgDanceability:{$avg:'$danceability'},
			avgEnergy:{$avg:'$energy'},
			avgSpeechiness:{$avg:'$speechiness'},
			avgAcousticness:{$avg:'$acousticness'},
			avgExplicit:{$avg:'$explicit'},
			avgLiveness:{$avg:'$liveness'},
			avgDuration:{$avg:'$duration_ms'}
		});
		q.project({'_id':0});
		var result= await q.exec();
		toRet.push(result[0]);
	}
	var artists=[];
	for(var i=0;i<ids.length;i++){
		if(ids[i]){
			var resultFind=await exports.artistDetails(ids[i]);
			artists.push(resultFind.data[0].name);
		}
		else{
			artists.push(null);
		}
		
	}
	
	
	await res.json({labels:artists,value:toRet,
		colors:util.getNColors(ids.length),
		colorsAlpha:util.getNColors(ids.length,"20")
	});


	
}

exports.lookupGenresTracks = async function(req,res){
	var idQ=req.query.genres;
	var ids=[];
	if(!Array.isArray(idQ)){
		ids.push(idQ);
	}
	else{
		ids=idQ;
	}
	var toRet=[];
	for(var i=0;i<ids.length;i++){
		var id=ids[i];
		var q=artistDb.aggregate();
		q.allowDiskUse(true);
		q.match({genres:id});
		q.lookup({
			from: 'tracks',
			localField: 'id',
			foreignField: 'id_artists',
			as: 'tracks'
		});
		q.unwind('tracks');
		q.replaceRoot("tracks");
		q.group({
			_id: null,
			avgDanceability:{$avg:'$danceability'},
			avgEnergy:{$avg:'$energy'},
			avgSpeechiness:{$avg:'$speechiness'},
			avgAcousticness:{$avg:'$acousticness'},
			avgExplicit:{$avg:'$explicit'},
			avgLiveness:{$avg:'$liveness'},
			avgDuration:{$avg:'$duration_ms'}
		});
		q.project({'_id':0});
		var result= await q.exec();
		toRet.push(result[0]);
	}
	await res.json({labels:ids,value:toRet,
		colors:util.getNColors(ids.length),
		colorsAlpha:util.getNColors(ids.length,"20")
	});

	
}


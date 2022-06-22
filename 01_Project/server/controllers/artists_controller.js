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

exports.findArtists = async function(req,res){
	var fieldName = req.query.fieldName;
	var value = req.query.value;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;
	var artists=await commonController.find(artistDb,[{fieldName:fieldName,value:value}],sortField,typeSort,limit,skip);	
	res.json(artists);	
}

exports.artistDetails = async function(id){
	var res=await commonController.find(artistDb,[{fieldName:"id",value:id}],"id",1,1,0);	
	return res;
}


exports.contaPerGenere = async function(req,res){
	var valueSearch = req.query.search;
	var countNull = req.query.countNull;
	var sortField = req.query.sortField;
	var typeSort = req.query.typeSort;
	var limit=req.query.limit;
	var skip=req.query.skip;








}


const util = require("../util/util");
exports.count=async function(model,fieldsValue){
	var q=model.count(util.createFilterString(fieldsValue));
	return q.exec();
}
exports.find=async function(model,fieldsValue,sortField,typeSort,limit,skip){
	var q=model.find(util.createFilterString(fieldsValue));
	console.log(fieldsValue);
	var count= await this.count(model,fieldsValue);
	
	if(sortField && typeSort){		
		q.sort({[sortField]: typeSort});
	}
	if(skip){
		q.skip(skip);
	}
	if(limit){
		q.limit(limit);
		
	}
	q.allowDiskUse(true);
	var res= await q.exec();
	return ({
		recordsTotal: count,
		recordsFiltered: count,
		data:res
	});
}
exports.findMinOrMax = async function(model,fieldName,max=true,onlyField=true){
	var res= await model.find({}).sort({[fieldName]: max?-1:1}).limit(1);
	if(onlyField){
		return res[0][fieldName];
	}
	return res;
}



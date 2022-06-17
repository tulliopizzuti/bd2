exports.createFilterString = function(fieldName,value){
	if(fieldName && value){
		return {
			[fieldName]: { $regex: '.*' + value + '.*', '$options' : 'i'  } 
		};
	}
	return {};
}
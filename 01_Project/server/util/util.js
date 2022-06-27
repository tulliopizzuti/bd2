const moment = require("moment");

exports.createFilterString = function(fieldsValue){
	if(fieldsValue){
		var toRet={};
		fieldsValue.forEach(function(x){
			if(x.custom){
				toRet[x.fieldName]=x.value;
			}
			else{
				toRet[x.fieldName]={ $regex: '.*' + x.value + '.*', '$options' : 'i'  } ;

			}
		});
		return toRet;
	}
	return {};
}
var hexColor=[
"#29b6f6",
"#ef5350",
"#ab47bc",
"#42a5f5",
"#7e57c2",
"#ff7043",
"#9ccc65",
"#66bb6a",
"#5c6bc0",
"#ec407a",
"#ffa726",
"#26a69a",
"#26c6da",
"#d4e157",
"#ffca28",
"#78909c",
"#8d6e63",
"#bdbdbd",
"#ffee58"
];
exports.getNColors=function(n,alpha="",skip=0){
	var toRet=[];
	var i=skip;
	while(toRet.length<n){
		i=(i%hexColor.length);
		toRet.push(hexColor[i++]+alpha);
		

	}
	return toRet;
}
exports.formatDate=function(date,format="DD/MM/yyyy"){
	return moment(new Date(date)).format(format);
}

exports.hexColor=hexColor;
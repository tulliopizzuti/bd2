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
"#ef5350",
"#ec407a",
"#ab47bc",
"#7e57c2",
"#5c6bc0",
"#42a5f5",
"#29b6f6",
"#26c6da",
"#26a69a",
"#66bb6a",
"#9ccc65",
"#d4e157",
"#ffee58",
"#ffca28",
"#ffa726",
"#ff7043",
"#8d6e63",
"#bdbdbd",
"#78909c"
];
exports.getNColors=function(n){
	var toRet=[];
	var i=0;
	while(toRet.length<n){
		toRet.push(hexColor[i++]);
		i=(i%hexColor.length);

	}
	return toRet;
}
exports.formatDate=function(date,format="DD/MM/yyyy"){
	return moment(new Date(date)).format(format);
}

exports.hexColor=hexColor;
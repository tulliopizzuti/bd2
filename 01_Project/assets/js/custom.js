$(document).ready(function(){
	setActiveItemMenu();
}); 
function setActiveItemMenu(){
	var page = $('menu').attr('value');
	if(!page){
		page="index";
	}
	$('ul.menu').find('#'+page).parent().addClass('active');
}
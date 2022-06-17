$(document).ready(function(){
	setActiveItemMenu();
}); 
function setActiveItemMenu(){
	var path = window.location.pathname;
	var page = path.split("/").pop();
	if(page.includes('.html')){
		page=page.replace('.html','');
	}
	else{
		page='index';
	}
	$('ul.menu').find('#'+page).parent().addClass('active');
}
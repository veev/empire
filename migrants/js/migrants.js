var migrantsLoaded = false;
var migrantsActive = false;


function migrants_sizer() {
	
	var padtop = 84; // top of the main title
	var matop = padtop + 70; // top of the matrix

	var legbottom = 30; //offset of the bottom play button on the open screen
	var body = $('html body');
	// if($(".yellow:first").height() < 780){ // if this a wee screen
	// 	padtop = 10;
	// 	matop = 20;
	// 	legbottom = 20;
	// }
	
	$("#migrants_title").css({ 'padding-top': padtop, 'height' : matop });

	$("#mainarea").css({ "margin-top": 0 });
	
	var w = $(window).width();
	var h = $(window).height();
	// var vtop = (($("#legacy_main").height() - h) / 2) - 50;
	
	$(".vertical_line").css({ 'height' : h });
	$("#migrants_wline1").css({ 'height': h });
	$("#migrants_wline2").css({ 'height': h });
	$("#migrants_wline3").css({ 'height': h });

	$("#m_legmore").css({ "margin-left": ($("#migrants_main").width() / 2) - 90 });

	$("#migrantsmore").css({"bottom": legbottom, "left": (w/2) - 62 }).fadeIn(4000).on('click', function() {
		body.animate({scrollTop: ($('#migrants_main').offset().top) }, 1000);
		// console.log("migrants_openscreen() in migrantsmore");
		if(!migrantsLoaded) {
			//console.log("[Migrants: migrantsmore listener] if not migrantsLoaded, migrants openscreen");
			//migrants_openscreen();
		}
	});

	//console.log("migrants_sizer");
}
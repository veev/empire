var legacyLoaded = false;
var legacyActive = false;
var _adjuster = 140;

function legacy_sizer() {

	var h = $("#legacy_top").height();
	var w = $("#legacy_top").width();
	//console.log("w: "+w+ ", h: " + h);
	var padtop = h * 0.11; // top of the main title
	//console.log("padtop: " + padtop);
	var matop = 40; // top of the matrix
	//var padtop = 84; // top of the main title
	var legbottom = 70; //offset of the bottom play button on the open screen
	var body = $('html body');
	var buffer = h - legbottom;
	//console.log("buffer = "+ buffer);
	var centering = (w/2) - 70;
	//console.log("centering = "+ centering);
	if($(".legacy_top:first").height() < 780){ // if this a wee screen
		padtop = 20;
		matop = 20;
		legbottom = 20;
	}
	
	$(".legacy_bottom").css("height",$(".legacy_top:first").height());
	
	$("#legacy_title").css({ 'padding-top': padtop });

	$("#mainarea").css({ "margin-top": matop });	

	$(".vertical_line").css({ 'height' : h });
	$("#legacy_wline1").css({ 'height': h/2 });
	$("#legacy_wline2").css({ 'height': h/2 });
	
	var w = ($("#legacy_main").width() - _adjuster);
	var h = ($("#legacy_main").width() - _adjuster) * .31
	var vtop = (($("#legacy_main").height() - h) / 2) - 50;

	$("#ctn0").css({'top': (vtop - 75), 'left': ((w / 2) + 20) });
	$("#ctn1").css({'top': ((vtop + (h / 2)) - 50), 'right': 30 });
	$("#ctn2").css({'top': (vtop + h + 75), 'left': ((w / 2) + 20) });
	$("#ctn3").css({'top': ((vtop + (h / 2)) - 70), 'left': 12 });

	// $("#legplay").css({ "bottom": legbottom, "margin-left": ($("#legacy_main").width() / 2) - 50 }).fadeIn(4000);
	$("#legmore").css({ "margin-left": ($("#legacy_main").width() / 2) - 90 });

	$("#legacymore").css({ "top" : buffer, "left": centering }).fadeIn(4000).on('click', function() {
		body.animate({scrollTop: ($('#legacy_main').offset().top) }, 1000);
		// console.log("legacy_openscreen() in legacymore");
		if(!legacyLoaded) {
			//console.log("[Legacy: legacymore listener] if not legacyLoaded, legacy openscreen");
			//legacy_openscreen();
		}
	});

	// $("#mainarea").css({ "bottom": legbottom - 50 });

	//console.log("legacy_sizer");
}
var legacyLoaded = false;
var legacyActive = false;
var _adjuster = 140;
var openTimeIvl;
var india_vid_loaded, indo_vid_loaded, srilanka_vid_loaded, southafrica_vid_loaded, corners_vid_loaded;
var l_videoTrackCurrentPosition;


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
		console.log("[Legacy: legacymore listener] if not legacyLoaded, legacy openscreen");
		legacy_openscreen();
	});
}

function legacy_openscreen() {
	$("#l_instructions").fadeIn(2000);

	//openTimeIvl = = setTimeout("legacy_closescreen()",10000);

	$("#l_instructions").on('click', function () { 
		//console.log("[ Legacy : legacy_openscreen ] + Calling playbutton in instructions event handler")
		legacy_closescreen(); 
		//console.log("[ Legacy : legacy_openscreen ] legacy_closescreen on instructions click");
	});
}

function legacy_closescreen() {
	$("#l_instructions").fadeOut(1000, function() {
		//console.log("[Periphery: periphery_closescreen ] p_playButton");
		
	leg_playVideos();

	});
}

function leg_playVideos() {
	if (legacyActive) {
		if(indo_vid_loaded === true && india_vid_loaded === true && southafrica_vid_loaded === true && srilanka_vid_loaded === true ) {
			console.log("[leg_playVideos] Legacy videos loaded");
			document.getElementById("indonesia_leg").play();
			document.getElementById("india_leg").play();
			document.getElementById("southafrica_leg").play();
			document.getElementById("srilanka_leg").play();
			document.getElementById("corners").play();
		} else {
			console.log("[leg_playVideos] Legacy videos have not loaded");
		}
	} else {
		console.log("[leg_playVideos] Legacy is not active");
	}
}

function leg_pauseVids() {
	l_videoTrackCurrentPosition  = document.getElementById("srilanka_leg").currentTime;
	console.log("[leg_pauseVids] Legacy videos paused");
	document.getElementById("indonesia_leg").pause();
	document.getElementById("india_leg").pause();
	document.getElementById("southafrica_leg").pause();
	document.getElementById("srilanka_leg").pause();
	document.getElementById("corners").pause();
}

function leg_endVids() {

}

function leg_scrubberUpdater() {

}

function loadIndonesiaVid() {
	indo_vid_loaded = true;
	console.log("[ Legacy : Canplay Event ] Indonesia Video = " + indo_vid_loaded);
}

function loadIndiaVid() {
	india_vid_loaded = true;
	console.log("[ Legacy : Canplay Event ] India Video = " + india_vid_loaded);
}

function loadSouthAfricaVid() {
	southafrica_vid_loaded = true;
	console.log("[ Legacy : Canplay Event ] South Africa Video = " + southafrica_vid_loaded);
}

function loadSriLankaVid() {
	srilanka_vid_loaded = true;
	console.log("[ Legacy : Canplay Event ] Sri Lanka Video = " + srilanka_vid_loaded);	
}

function loadCornersVid() {
	corners_vid_loaded = true;
	console.log("[ Legacy : Canplay Event ] Corners Video = " + corners_vid_loaded);
}

function indoPlayCallback() {
	console.log("[ Legacy ] Indonesia Video paused ? " + document.getElementById("indonesia_leg").paused);
}

function indiaPlayCallback() {
	console.log("[ Legacy ] India Video paused ? " + document.getElementById("india_leg").paused);
}

function southafricaPlayCallback() {
	console.log("[ Legacy ] South Africa Video paused ? " + document.getElementById("southafrica_leg").paused);
}

function srilankaPlayCallback() {
	console.log("[ Legacy ] Sri Lanka Video paused ? " + document.getElementById("srilanka_leg").paused);
}

function cornersPlayCallback() {
	console.log("[ Legacy ] Corners Video paused ? " + document.getElementById("corners").paused);
}

function addIndonesiaListeners() {
	var indonesia_video = document.getElementById("indonesia_leg");
	indonesia_video.addEventListener("canplay", loadIndonesiaVid, true);
	indonesia_video.addEventListener("ended", leg_endVids, true);
	indonesia_video.addEventListener("timeupdate", leg_scrubberUpdater, true);
	indonesia_video.addEventListener("play", indoPlayCallback, true);
}

function addIndiaListeners() {
	var india_video = document.getElementById("india_leg");
	india_video.addEventListener("canplay", loadIndiaVid, true);
	india_video.addEventListener("ended", leg_endVids, true);
	india_video.addEventListener("timeupdate", leg_scrubberUpdater, true);
	india_video.addEventListener("play", indiaPlayCallback, true);
}

function addSouthAfricaListeners() {
	var southafrica_video = document.getElementById("southafrica_leg");
	southafrica_video.addEventListener("canplay", loadSouthAfricaVid, true);
	southafrica_video.addEventListener("ended", leg_endVids, true);
	southafrica_video.addEventListener("timeupdate", leg_scrubberUpdater, true);
	southafrica_video.addEventListener("play", southafricaPlayCallback, true);
}

function addSriLankaListeners() {
	var srilanka_video = document.getElementById("srilanka_leg");
	srilanka_video.addEventListener("canplay", loadSriLankaVid, true);
	srilanka_video.addEventListener("ended", leg_endVids, true);
	srilanka_video.addEventListener("timeupdate", leg_scrubberUpdater, true);
	srilanka_video.addEventListener("play", srilankaPlayCallback, true);
}

function addCornersListeners() {
	var corners_video = document.getElementById("corners");
	corners_video.addEventListener("canplay", loadCornersVid, true);
	corners_video.addEventListener("ended", leg_endVids, true);
	corners_video.addEventListener("timeupdate", leg_scrubberUpdater, true);
	corners_video.addEventListener("play", cornersPlayCallback, true);
}

function addLegacyListeners() {
	addIndonesiaListeners();
	addIndiaListeners();
	addSouthAfricaListeners();
	addSriLankaListeners();
	addCornersListeners();
}

function removeLegacyListeners() {
 // do we need?
}

function allVolumeUp() {
	document.getElementById("india_leg").volume = 1;
	document.getElementById("srilanka_leg").volume = 1;
	document.getElementById("southafrica_leg").volume = 1;
	document.getElementById("indonesia_leg").volume = 1;
	console.log("all volume up");
}

var indiaVolumeUp = function() {

	document.getElementById("india_leg").volume = 1;
	document.getElementById("srilanka_leg").volume = 0;
	document.getElementById("southafrica_leg").volume = 0;
	document.getElementById("indonesia_leg").volume = 0;
	console.log("india volume up");
}

var viewIndia = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	indiaVolumeUp();
	$(this).zoomTarget();
}

var srilankaVolumeUp = function() {
	document.getElementById("india_leg").volume = 0;
	document.getElementById("srilanka_leg").volume = 1;
	document.getElementById("southafrica_leg").volume = 0;
	document.getElementById("indonesia_leg").volume = 0;
	console.log("sri lanka volume up");
}

var viewSriLanka = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	srilankaVolumeUp();
	$(this).zoomTarget();
}

var southafricaVolumeUp = function() {
	document.getElementById("india_leg").volume = 0;
	document.getElementById("srilanka_leg").volume = 0;
	document.getElementById("southafrica_leg").volume = 1;
	document.getElementById("indonesia_leg").volume = 0;
	console.log("south africa volume up");
}

var viewSouthAfrica = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	southafricaVolumeUp();
	$(this).zoomTarget();
}

var indonesiaVolumeUp = function() {
	document.getElementById("india_leg").volume = 0;
	document.getElementById("srilanka_leg").volume = 0;
	document.getElementById("southafrica_leg").volume = 0;
	document.getElementById("indonesia_leg").volume = 1;
	console.log("indonesia volume up");
}

var viewIndonesia = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	indonesiaVolumeUp();
	$(this).zoomTarget();
}

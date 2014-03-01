var rotate = 0;
var pcard = document.getElementById('pcard');
var p_curtime = 0;
var _seektime = 0;
var p_flipside = false;
var p_leftside = false;
var p_flipangle = 0;
var numRotations = 0;
var p_prevflipangle = 0;
var p_flipblock = false;
var p_controls = false;
var p_vidLoaded = false;
var p_audio1Loaded = false;
var p_audio2Loaded = false;
//var vid2Loaded = false;
var p_playState = 0;
var mouseYTracking = false;
var instructionsin = false;
var p_enoughwithinstructions = false;
var pbottom;

//these were declared in empirecore.js, now cradle.js doesn't know about that
var audioactive = false;
var _ammobile = false;
var dontannoysam = false;

var audioLevelNorm, audioLevelYeti;

var p_inseek = false;
var p_trackingon = false;
var p_currentvideoid;
var p_lazywidth = 0;

var openIvl = new Number();
var p_sidetracker = new Object(); // tracking element to get the visualisation later
var p_scrubberlength;

var _transitiontimer = new Number();
var _transitiontimerIvl = new Number();

var audioTrackCurrentPosition = 0;
var videoTrackCurrentPosition = 0;

function map(i, sStart, sEnd, tStart, tEnd) {
		var v = i-sStart;
		if (v>=0) {
				if (i < sStart) {
						return tStart;
				} else if (i > sEnd) {
						return tEnd;
				}
		} else {
				if (i < sStart) {
						return tStart;
				} else if (i < sEnd){
						return tEnd;
				}
		}
		var sRange = sEnd - sStart;
		if (sRange == 0) {
				return tStart;
		}

		var tMax = tEnd - tStart;
		return tStart + v / sRange * tMax;
}

function p_playhandler () {
	// p_playState = 1;
	// //console.log("p_playhandler p_playState: "+ p_playState);
	// periphery_closescreen();
	// document.getElementById("mobileisgreat").controls = false;
	// if(!p_controls){
	// 	p_enablecontrols();
	// }
}

function p_loadVideo () {
	//console.log("[ Periphery : Canplaythrough Event ] Video ");
	p_vidLoaded = true;
}

function p_loadAudio () {
	//console.log("[ Periphery : Canplaythrough Event ] Audio1 ");
	p_audio1Loaded = true;
}

function p_loadAudio2 () {
	//console.log("[ Periphery : Canplaythrough Event ] Audio2 ");
	p_audio2Loaded = true;
}

function p_playVidsCallback(){
	mouseYTracking = true;
	//console.log("[ Periphery : Play Event ] Video tracking ? " + mouseYTracking);
}

function p_pauseVidsCallback(){
// console.log("[ Pause video ] Video paused ? " + document.getElementById("target").paused);
// console.log("[ Pause video ] audio_norm paused ? " + document.getElementById("audio_norm").paused);
// console.log("[ Pause video ] audio_yeti ? " + document.getElementById("audio_yeti").paused);
// console.log("[ Pause video ] Video tracking ? " + mouseYTracking);
	mouseYTracking = true; 
	//console.log("[ Periphery : Pause video ] Video tracking ? " + mouseYTracking);
}


function p_enablecontrols () {

	p_controls = true;

	// if(_ammobile){
	//   trackon();  
	// } else {
	$("#p_outerouter").on('mouseenter', function () {
		if(mouseYTracking) {
			//$("#periphery_arrows").css({'z-index': })
			//trackMouseY();
			// console.log("[ Periphery : Tracking Mouse]");
			trackMouseRotation();
		} else {
			// console.log("not tracking mouse Y");
		}
		// console.log('mouseenter');
	});

	// $("#p_outerouter").on('mousemove', function () {
	//   if(mouseYTracking) {
	//    // trackMouseY();
	//		trackMouseRotation();
	//   } else {
	//     //console.log("not tracking mouse Y");
	//   }
	//   console.log('mousemove');
	// });

	$("#p_outerouter").on('mouseleave', function () {
		if(p_flipangle < 90) {
				//console.log("less than 90");
				p_flipangle = 0;
				//set yeti volume to 0, norm to 1
			// document.getElementById("audio_norm").volume = 1;
			// document.getElementById("audio_yeti").volume = 0;

			} else if (p_flipangle > 90 ) {
				// console.log("greater than 90");
				p_flipangle = 180;
			//set yeti volume to 1, norm to 0
			// document.getElementById("audio_norm").volume = 0;
			// document.getElementById("audio_yeti").volume = 1;
			}
			// $("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)' });
			 p_trackoff();
			//console.log('mouseleave');
		}); 
	// }
	
	$("#leftbutton").on('click', function () {
		if(p_flipside){
			// flipper(true);
		}
	});
	$("#rightbutton").on('click', function () {
		if(!p_flipside){
			// flipper(false);
		}
	});
}

function p_disablecontrols () {
	$("#p_outerouter").unbind("mouseenter");
	$("#p_outerouter").unbind("mouseleave");
	$("#leftbutton").unbind("click");
	$("#rightbutton").unbind("click");
	p_controls = false;
}

function periphery_scrollsnaphandle () {
	if($(this).attr('id') == "periphery_main"){
		if(!p_enoughwithinstructions){
			if(!_ammobile){
				// p_playDecide();
			}
			else{
				console.log("MOBILE");
			}
			periphery_openscreen();
		}
	}
}

// $(window).resize(function () {
// 	periphery_sizer();
// 	p_lazywidth = $("#p_outerouter").width();
// 	var marginsize = (p_lazywidth - 960) / 2;
// 	p_leftpoint = marginsize + 180;
// 	p_rightpoint = (p_lazywidth - marginsize) - 180;
// });

function periphery_openscreen () {
	$("#p_instructions").fadeIn(2000);
	 if(_ammobile){

		 $("#ptitle").show();
		 // $("#p_instructions").css({ 'pointer-events':'none' });
	 } else {
	 	console.log("[Periphery: openscreen ] periphery_closescreen on setTimeout 1");
		openIvl = setTimeout("periphery_closescreen()",10000);
		
	}
	$("#p_instructions").on('click', function () { 
		console.log("[ Periphery : periphery_openscreen ] + Calling playbutton in instructions event handler")
		//p_playButton();
		periphery_closescreen(); 
		console.log("[Periphery: openscreen] periphery_closescreen on instructions click");
		//trackMouseRotation();
	});

	// openIvl = setTimeout("periphery_closescreen()",10000);
	// console.log("[Periphery: openscreen ] periphery_closescreen on setTimeout 2");
	p_enoughwithinstructions = true;
}

function periphery_closescreen () {
	clearInterval(openIvl);
	$("#p_instructions").fadeOut(1000, function() {
		//console.log("[Periphery: periphery_closescreen ] p_playButton");
		if(peripheryActive && document.getElementById("target").paused) {
			p_playButton();
		}
		trackMouseRotation();
	});
}

function periphery_sizer () {

	// var matop = ($("#periphery_top").height() / 2) - 320; // top of the matrix
	var matop = 210;
	var padtop = 84; // top of the main title
	var legbottom = 30; //offset of the bottom play button on the open screen
	var body = $('html body');
	// if($("#periphery_top").height() < 780){ // if this a wee screen
	//   padtop = 10;
	//   matop = 120;
	//   legbottom = 20;
	// }

	$("#p_outerouter").css({ 'padding-top': (($("#periphery_top").height() / 2) - ($("#p_outerinner").height() / 2)) });
	$(".periphery_intro").css({ 'top': -30});
	
	$("#periphery_bottom").css("height",$("#periphery_top").height());

	$('#periphery_line').css({ 'top': matop, 'height': 100, 'left': (($("#periphery_top").width() / 2)) });
	$('#periphery_line2').css({ 'top': 610, 'height': 300, 'left': (($("#periphery_top").width() / 2)) });

	$("#periphery_linewhite").css({ 'height': $("#periphery_main").height(), 'left': (($("#periphery_top").width() / 2)) });
	$('#periphery_bottomline').css({ 'top': 0, 'height': 200, 'left': (($("#periphery_top").width() / 2)) });
	
	$("#periphery_title").css({ 'padding-top': padtop });

	$("#periphery_structure").css({ 'margin-top': matop, 'left': (($("#periphery_top").width() / 2) - 370) });
	$("#pbottom_structure").css({ 'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 330), 'left': ($("#periphery_top").width() / 2)-286 });

	$("#p_legmore").css({ "margin-left": ($("#periphery_main").width() / 2) - 70 }).on('click', function() {
		body.animate({scrollTop: ($("#periphery_bottom").offset().top)}, 1000);
	});

	// $("#peripheryplay").css({ "bottom": legbottom, "margin-left": ($("#periphery_top").width() / 2) - 70 }).fadeIn(4000).click(function () {    
	//   $('html, body').animate({ scrollTop: ($('#periphery_main').offset().top) }, 1000);
	//   if(!_ammobile){
	//     // p_playDecide();
	//   }
	//   periphery_openscreen();
	// });

	$("#peripherymore").css({"bottom": legbottom, "margin-left": ($("#periphery_top").width() / 2) - 70 }).fadeIn(4000).click(function() {

		body.animate({scrollTop: ($('#periphery_main').offset().top) }, 1000);
		console.log("periphery video currentTime = " + document.getElementById("target").currentTime);
		if(document.getElementById("target").currentTime == 0 ) {
			periphery_openscreen();

		}
		else {
			p_toggleButtonDisplay();
		}
	});

	 $("#periphery_returnTop").css({'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 330), "margin-left": ($("#cradle_bottom").width() / 2) - 70 }).fadeIn(4000).click(function() {
		body.animate({scrollTop: ($('#periphery_top').offset().top) }, 1000);
	 });

}

function trackMouseRotation() {
	p_trackingon = true;
	$("#periphery_arrows").css({'z-index':'5'});
	var target = document.getElementById("target");
	var diag = Math.sqrt(target.width * target.width + target.height * target.height);
	var halfSide = diag / 2;
	var centroidX = $("#periphery_main").width() / 2;
	var centroidY = $("#periphery_main").height() / 2 + $("#periphery_top").height();
	var center = { x : centroidX, y : centroidY };
	//console.log(center);

	$(document).on('mousemove', function(e) {
		if(!p_flipblock) {
			//console.log("mouseX: " + e.pageX + ", mouseY: " + e.pageY);
					
			var vec = { x : e.pageX - center.x, y : e.pageY - center.y };
			//console.log("vec: " + vec.x + " , " + vec.y);
			p_flipangle = Math.PI -	Math.atan2(vec.x, vec.y);
			//console.log("flipangle radians: " + p_flipangle);
			p_flipangle *= 180/ Math.PI;
			// console.log("flipangle degrees: " + p_flipangle);

			//set audio according to angle
			if(p_flipangle >= 0 && p_flipangle <= 180) {
				audioLevelNorm = map(p_flipangle, 0, 180, 1, 0);
				audioLevelYeti = map(p_flipangle, 0, 180, 0, 1);
			} else if( p_flipangle > 180 && p_flipangle <= 360) {
				audioLevelNorm = map(p_flipangle, 180, 360, 0, 1);
				audioLevelYeti = map(p_flipangle, 180, 360, 1, 0);
			}

			// console.log('audioLevelNorm: ' + audioLevelNorm);
			// console.log('audioLevelYeti: ' + audioLevelYeti);

			//Is this the best place to set volume?
			document.getElementById("audio_norm").volume = audioLevelNorm;
			document.getElementById("audio_yeti").volume = audioLevelYeti;

			syncTime();

			//put sticky positions back in
			//4 positions
			// if(p_flipangle > 0 && p_flipangle < 45) {
			// 	p_flipangle = 0;
			// } else if (p_flipangle >= 45 && p_flipangle <= 135) {
			// 	p_flipangle = 90;
			// } else if (p_flipangle > 135 && p_flipangle < 225) {
			// 	p_flipangle = 180;
			// } else if (p_flipangle >= 225 && p_flipangle < 315) {
			// 	p_flipangle = 270;
			// } else if (p_flipangle >= 315 && p_flipangle < 360) {
			// 	p_flipangle = 359;
			// }

			//8 positions
			if(p_flipangle > 0 && p_flipangle < 35) {
				p_flipangle = 0;
			} else if (p_flipangle >= 35 && p_flipangle <= 55) {
				p_flipangle = 45;
			} else if (p_flipangle > 55 && p_flipangle < 125) {
				p_flipangle = 90;
			} else if (p_flipangle >= 125 && p_flipangle <= 145) {
				p_flipangle = 135;
			} else if (p_flipangle > 145 && p_flipangle < 215) {
				p_flipangle = 180;
			} else if (p_flipangle >= 215 && p_flipangle <= 235) {
				p_flipangle = 225;
			} else if (p_flipangle > 235 && p_flipangle < 305) {
				p_flipangle = 270;
			} else if (p_flipangle <= 305 && p_flipangle >= 325) {
				p_flipangle = 315;
			} else if (p_flipangle > 325 && p_flipangle < 360) {
				p_flipangle = 360;
			}
			//console.log("p_flipangle after sticky: " + p_flipangle);

			if(p_flipangle  > 300   && p_prevflipangle < 60  ){
				numRotations--;
			}
			else if(p_flipangle  < 60   && p_prevflipangle > 300   ){
				numRotations++;
			}
				
			p_prevflipangle = p_flipangle;
			//here
			p_flipangle = 360*numRotations + p_flipangle ;

			//console.log("after if stat flipangle degrees: " + numRotations);

			$("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)',"transition": "all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)" });
		}
	});
}

function syncTime() {
	if(p_vidLoaded && p_audio1Loaded && p_audio2Loaded) {
		var audioNorm = document.getElementById("audio_norm");
		var audioYeti = document.getElementById("audio_yeti");
		videoTrackCurrentPosition  = document.getElementById("target").currentTime;

		if(audioNorm.volume === 0) {
			audioNorm.currentTime = videoTrackCurrentPosition;
			//console.log("syncing audio Norm");
		}

		if(audioYeti.volume === 0) {
			audioYeti.currentTime = videoTrackCurrentPosition;
			//console.log("syncing audio Yeti");
		}
	}
}

// function trackMouseY() {
// 	p_trackingon = true;
// 	//console.log("periphery tracking is: " + p_trackingon);
// 	$(document).on('mousemove', function(e) {
// 		if(!p_flipblock) {
// 			var y = e.pageY;
// 			var x = e.pageX;
// 			//console.log(y);
// 			//console.log("leftside = " + leftside);
// 			//console.log("p_lazywidth = " + p_lazywidth);
// 			var buffer = 200;
// 			var newTop = lazyYtop + buffer;
// 			var newBottom = lazyYbottom - buffer;
// 			//console.log(y + ", " + newTop + ", " + newBottom);

// 			audioLevelNorm = map(y, newTop, newBottom, 1, 0);
// 			audioLevelYeti = map(y, newTop, newBottom, 0, 1);
			
			
// 			p_flipangle = map(y, newTop, newBottom, 0, 180);  
			

// 			if(p_flipangle > 0 && p_flipangle < 35) {
// 				p_flipangle = 0;
// 				// audioLevelNorm = 1.0;
// 				// audioLevelYeti = 0.0;
// 			}

// 			if(p_flipangle > 35 && p_flipangle < 55){
// 				p_flipangle = 45;
// 				// audioLevelNorm = 0.75;
// 				// audioLevelYeti = 0.25;
// 			}
// 			if(p_flipangle > 55 && p_flipangle < 125){
// 				p_flipangle = 90;
// 				// audioLevelNorm = 0.5;
// 				// audioLevelYeti = 0.5;

// 			}
// 			if(p_flipangle > 125 && p_flipangle < 145){
// 				p_flipangle = 135;
// 				// audioLevelNorm = 0.25;
// 				// audioLevelYeti = 0.75;
// 			}

// 			if(p_flipangle > 145 && p_flipangle < 180) {
// 				p_flipangle = 180;
// 				// audioLevelNorm = 0.0;
// 				// audioLevelYeti = 1.0;
// 			}

// 			// console.log("p flip angle: " + p_flipangle + " , p flipped :" + p_flipside) ;
// 			// console.log("audioLevelNorm: " + audioLevelNorm);
// 			// console.log("audioLevelYeti: " + audioLevelYeti);

// 			//Is this the best place to set volume?
// 			document.getElementById("audio_norm").volume = audioLevelNorm;
// 			document.getElementById("audio_yeti").volume = audioLevelYeti;

// 			$("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)' });
// 		}
// 	});
// }



function p_trackoff () {
	//console.log('p_trackoff');
	p_trackingon = false;
// mouseYTracking = false;
	$(document).unbind("swipeleft");
	$(document).unbind("swiperight");
	$(document).unbind('mousemove');
	$(document).unbind('mouseenter');
	$(document).unbind('mouseleave');

	$("#periphery_arrows").css({'z-index': '12'});

	// removePeripheryListeners();
		
	// console.log("Remove Events for periphery");
}

function p_playDecide(){
//  document.getElementById("video2").volume = 0;
		//console.log("Playing periphery videos");
	
		// p_playVids();

		// p_playState = 1;
		// console.log("p_playDecide p_playState: "+ p_playState);
		// mouseYTracking = true;
		// console.log("p_playDecide mouseYTracking: "+ mouseYTracking);

		//console.log("Not Playing videos");
		// setTimeout("p_playDecide()",800);
}

function p_restartVids() {
	p_playState = 1;
	//console.log("p_restartVids p_playState: "+ p_playState);
	document.getElementById("target").currentTime = 0;
	document.getElementById("target").volume = 0;
	document.getElementById("audio_norm").currentTime = 0;
	document.getElementById("audio_yeti").currentTime = 0;
	document.getElementById("target").play();
	document.getElementById("audio_norm").play();
	document.getElementById("audio_yeti").play();
}

function addPeripheryListeners(){
	document.getElementById("target").addEventListener("canplay", p_loadVideo, true);
	document.getElementById("target").addEventListener("ended", p_endVids, true);
	document.getElementById("target").addEventListener("timeupdate", p_scrubberUpdater, true);
	document.getElementById("target").addEventListener("play", p_playVidsCallback, true);
	document.getElementById("target").addEventListener("pause", p_pauseVidsCallback, true);
	document.getElementById("audio_norm").addEventListener("canplay", p_loadAudio, true);
	document.getElementById("audio_yeti").addEventListener("canplay", p_loadAudio2, true);
	//console.log("added Periphery Listeners");
}

function removePeripheryListeners(){

	document.getElementById("target").removeEventListener("canplay", p_loadVideo, true);
	document.getElementById("target").removeEventListener("ended", p_endVids, true);
	document.getElementById("target").removeEventListener("timeupdate", p_scrubberUpdater, true);
	document.getElementById("target").removeEventListener("play", p_playVidsCallback, true);
	document.getElementById("target").removeEventListener("pause", p_pauseVidsCallback, true);
	document.getElementById("audio_norm").removeEventListener("canplay", p_loadAudio, true);    
	document.getElementById("audio_yeti").removeEventListener("canplay", p_loadAudio2, true);
	//console.log("removed Periphery Listeners");

}
function p_playButton(){

	if(peripheryActive) {
		mouseYTracking = true;

		// console.log("[ Play Button ] Is Video paused ? "+ document.getElementById("target").paused);
		if(document.getElementById("target").paused){
			p_playVids();  
		}
		else{
			p_pauseVids();
		}
	}
	else {
		//console.log("[ Periphery: p_playButton ] peripheryActive ? : " + peripheryActive);
	}
}


function p_playVids(){
	if(audioactive){
		audiostop();
		//console.log("[Periphery: p_playVids ] audiostop()");
	}
	 
	 if(p_vidLoaded && p_audio1Loaded && p_audio2Loaded){
		//console.log("[ Periphery : playVids ] videoTrackCurrentPosition = " + videoTrackCurrentPosition);
		document.getElementById("target").currentTime = videoTrackCurrentPosition ;
		document.getElementById("target").volume = 0;
		document.getElementById("target").play();
		// mouseYTracking = true;
		// console.log("playVids mouseYTracking = " + mouseYTracking);
		p_playAudio();
	 }
	 else{
		// console.log("[ Periphery ] Not playing media because? ");
		// console.log("Video loaded ? " + p_vidLoaded);
		// console.log("Audio1 loaded ? " + p_audio1Loaded);
		// console.log("Audio2 loaded ? " + p_audio2Loaded);
	 }  
}

function p_playAudio() {
	// console.log("Norm Tack Pos : " + audioTrackNormCurrentPosition+" Yeti Track Pos : " + audioTrackYetiCurrentPosition);
	document.getElementById("audio_norm").currentTime = videoTrackCurrentPosition ;
	document.getElementById("audio_yeti").currentTime = videoTrackCurrentPosition ;
	document.getElementById("audio_norm").play();
	document.getElementById("audio_yeti").play();

	//is this the best place to set yeti audio?
	// document.getElementById("audio_yeti").volume = audioLevelYeti;
	// document.getElementById("audio_norm").volume = audioLevelNorm;

}

function p_pauseVids(){

	// document.getElementById("audio_yeti").pause();
	currentTime =  document.getElementById("audio_yeti").currentTime ;
	// audioTrackCurrentPosition = document.getElementById("target").currentTime;
	// console.log("[ p_pauseVids ] audioTrackCurrentPosition = " + audioTrackCurrentPosition);

	//audioTrackCurrentPosition = document.getElementById("audio_yeti").currentTime;
	videoTrackCurrentPosition  = document.getElementById("target").currentTime;
	//console.log("[ Periphery : pauseVids ] videoTrackCurrentPosition = " + videoTrackCurrentPosition);

	// audiostop();
	document.getElementById("audio_yeti").pause();
	document.getElementById("audio_norm").pause();
	document.getElementById("target").pause(); 

	// p_playState = 2;
	// console.log("p_pauseVids p_playState: " + p_playState);
}

function p_endVids(){
	p_playState = 3;
	p_pauseVids();
	// console.log("p_endVids p_playState: " + p_playState);
	p_buildendscreen();
}

function p_scrubberUpdater (){

	var dur = Math.floor(document.getElementById("target").currentTime);
	if(dur > 0){
		var ratio = (document.getElementById("target").duration / dur);
	}
	
	p_curtime = document.getElementById("target").currentTime;

	$("#p_progress").css({ "width": (640 / ratio) + 'px' });
	if(document.getElementById("audio_yeti").volume > document.getElementById("audio_norm").volume ){
		p_sidetracker[Math.floor(document.getElementById("target").currentTime)] = 1;
		//console.log("yeti louder than norm");
	}
	else if (document.getElementById("audio_yeti").volume < document.getElementById("audio_norm").volume) {
		p_sidetracker[Math.floor(document.getElementById("target").currentTime)] = 2;
		//console.log("norm louder than yeti");
	}
	else {
		p_sidetracker[Math.floor(document.getElementById("target").currentTime)] = 0;
	}

	p_scrubberlength = Object.keys(p_sidetracker).length;

	//console.log("[ Periphery: p_scrubberUpdater ] scrubberlength: "+ scrubberlength);
}

function p_buildendscreen () {
	console.log("[ Periphery ] p_buildendscreen");
	$("#p_container").hide();
	$("#p_controls").hide();
	$("#p_endscreen").fadeIn();
	
	$("#p_legmore").fadeIn();
	
	if(_ammobile){
		p_trackoff();
	}
	
	// now the drawing
	var outputstring = new String();
	var nowtop = 0;
	var multiplier = 1.756;
	
	var yetiFraction = 0;
	var normFraction = 0;
	var equalFraction = 0;
	for(var i = 0; i < p_scrubberlength; i++){
		if( p_sidetracker[i] === 1){
			yetiFraction++;
		}
		else if (p_sidetracker[i] === 2){
			normFraction++;
		}
		else {
			equalFraction++;
		}

	}

	// console.log("[ Periphery: p_buildendscreen ] yetiFraction = " + yetiFraction);
	// console.log("[ Periphery: p_buildendscreen ] normFraction = " + normFraction);
	// console.log("[ Periphery: p_buildendscreen ] equalFraction = " + equalFraction);
	// console.log("[ Periphery: p_buildendscreen ] p_scrubberlength = " + p_scrubberlength);
	
	//adjust for time spent listening equally
	p_scrubberlength -= equalFraction;

	yetiFraction = yetiFraction / p_scrubberlength;
	// console.log("[ Periphery: p_buildendscreen ] yetiFraction yetiFraction / p_scrubberlength = " + yetiFraction);

	var endAngle = 0;
	if (yetiFraction > 0.5 ) {
		$("#p_person_b").fadeIn();
		endAngle = map(yetiFraction, 0.5, 1, 0, -90);
		// console.log("[ Periphery: p_buildendscreen ] 1 endAngle: " + endAngle);
	} else {
		$("#p_person_a").fadeIn();
		endAngle = map(yetiFraction, 0, 0.5, -90, 0);
		// console.log("[ Periphery: p_buildendscreen ] 2 endAngle: " + endAngle);
	}

	$("#p_people_data").css({ '-webkit-transform': 'rotate( ' + endAngle + 'deg)', 'transform': 'rotate( ' + endAngle + 'deg)' });

	$("#p_person_overlay").click(function () {
		p_sidetracker = {};
		$("#p_endscreen").fadeOut();
		$("#p_legmore").fadeOut();
		

		if(_ammobile){
			document.getElementById("mobileisgreat").currentTime = 0;
		} else {
			document.getElementById("target").currentTime = 0;
			document.getElementById("audio_norm").currentTime = 0;
			document.getElementById("audio_yeti").currentTime = 0;
			// document.getElementById("video2").currentTime = 0;
		}

		$("#p_container").fadeIn();
		$("#p_controls").fadeIn();

		p_playVids();

		$("#p_playElement").css({'background':'url(/periphery/art/playWhite.png)'})
		// c_playState = 1;  
		// console.log("p_buildendscreen p_playState: " + p_playState);          
	});
}



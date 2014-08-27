(function (window) {
	'use-strict';
	var controlsActive = false;
	var openIvl = new Number();
	
	var active = false;
	var firstTime = true;

	var videoLoaded = false;
	var audioNormLoaded = false;
	var audioYetiLoaded = false;
	var videoTrackCurrentPosition = 0;
	var sideTracker = new Object(); // tracking element to get the visualisation later
	var scrubberLength;
	var currentVideoId;
	var videoCurrentTime = 0;
	var mouseYTracking = false;
	var allVideosLoaded = false;
	
	var flipAngle = 0;
	var numRotations = 0;
	var previousFlipAngle = 0;
	var flipBlock = false;

	var instructions,
		outerOuter,
		container,
		peripheryContent,
		controls;

	var media = {
		target:null,
		audio_norm:null,
		audio_yeti:null
	}
	
	function map(i, sStart, sEnd, tStart, tEnd) {
		var v = i-sStart;
		if (v>=0) {
				if (i < sStart) { return tStart;}
				 else if (i > sEnd) { return tEnd;}
		} else {
				if (i < sStart) { return tStart;} 
				else if (i < sEnd){ return tEnd;}
		}

		var sRange = sEnd - sStart;
		if (sRange == 0) { return tStart; }

		var tMax = tEnd - tStart;
		return tStart + v / sRange * tMax;
	}

	function sizer () {

		var w = $("#periphery_top").width();
		var h = $("#periphery_top").height();
		//console.log(w + " : " +h);
		var matop = 210;
		var padtop = h * 0.11;  // top of the main title
		var legbottom = 70; //offset of the bottom play button on the open screen
		var buffer = h - legbottom;
		var centering = (w/2) - 70;
		var linetop = 610;
		var body = $('html body');
		if($("#periphery_top").height() < 780){ // if this a wee screen
		  padtop = 20;
		  matop = 120;
		  legbottom = 20;
		  linetop = 525;
		}

		outerOuter.css({ 'padding-top': (($("#periphery_top").height() / 2) - ($("#p_outerinner").height() / 2)) });
		$(".periphery_intro").css({ 'top': -30});
		// $("#periphery_bottom").css({"height": $("#periphery_top").height()});
		$('#periphery_line').css({ 'top': matop, 'height': 100, 'left': (($("#periphery_top").width() / 2) - 7) });
		$('#periphery_line2').css({ 'top': linetop, 'height': 300, 'left': (($("#periphery_top").width() / 2) - 7) });
		$("#periphery_linewhite").css({ 'height': $("#periphery_main").height(), 'left': (($("#periphery_top").width() / 2) - 7) });
		
		$('#periphery_bottomline').css({ 'top': 0, 'height': 200, 'left': (($("#periphery_top").width() / 2) - 7) });
		
		$("#periphery_title").css({ 'padding-top': padtop });
		$("#periphery_structure").css({ 'margin-top': matop, 'left': (($("#periphery_top").width() / 2) - 370) });

		$("#pbottom_structure").css({ 'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 300), 'left': ($("#periphery_top").width() / 2)-286 });
		$("#p_legmore").css({ "margin-left": ($("#periphery_main").width() / 2) - 70 }).on('click', function() {
			body.animate({scrollTop: ($("#periphery_bottom").offset().top)}, 1000);
		});
		$("#peripherymore").css({"top": buffer, "left": centering }).fadeIn(4000).click(function() {
			body.animate({scrollTop: ($('#periphery_main').offset().top) }, 1000);
			if(document.getElementById("target").currentTime == 0 ) {
				openScreen();
			}
			else {
				toggleButtonDisplay();
			}
		});

		 $("#periphery_returnTop").css({'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 330), "margin-left": ($("#cradle_bottom").width() / 2) - 70 }).fadeIn(4000).click(function() {
			body.animate({scrollTop: ($('#periphery_top').offset().top) }, 1000);
		 });
	}

	function toggleButtonDisplay() {
		if(document.getElementById("target") != null) {
			if(document.getElementById("target").paused) {
				//console.log("Toggle periphery play button on");
				$("#p_play_bg").fadeIn();
			} else {
				$("#p_play_bg").fadeOut();
				//console.log("Toggle periphery play button off");
			}
		}
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

		$(document).on('mousemove', function(e) {
			if(!flipBlock) {
				var vec = { x : e.pageX - center.x, y : e.pageY - center.y };
				flipAngle = Math.PI -	Math.atan2(vec.x, vec.y);
				flipAngle *= 180/ Math.PI;
				//set audio according to angle
				if(flipAngle >= 0 && flipAngle <= 180) {
					audioLevelNorm = map(flipAngle, 0, 180, 1, 0);
					audioLevelYeti = map(flipAngle, 0, 180, 0, 1);
				} else if( flipAngle > 180 && flipAngle <= 360) {
					audioLevelNorm = map(flipAngle, 180, 360, 0, 1);
					audioLevelYeti = map(flipAngle, 180, 360, 1, 0);
				}

				document.getElementById("audio_norm").volume = audioLevelNorm;
				document.getElementById("audio_yeti").volume = audioLevelYeti;

				syncTime();

				//8 positions
				if(flipAngle > 0 && flipAngle < 35) {
					flipAngle = 0;
				} else if (flipAngle >= 35 && flipAngle <= 55) {
					flipAngle = 45;
				} else if (flipAngle > 55 && flipAngle < 125) {
					flipAngle = 90;
				} else if (flipAngle >= 125 && flipAngle <= 145) {
					flipAngle = 135;
				} else if (flipAngle > 145 && flipAngle < 215) {
					flipAngle = 180;
				} else if (flipAngle >= 215 && flipAngle <= 235) {
					flipAngle = 225;
				} else if (flipAngle > 235 && flipAngle < 305) {
					flipAngle = 270;
				} else if (flipAngle <= 305 && flipAngle >= 325) {
					flipAngle = 315;
				} else if (flipAngle > 325 && flipAngle < 360) {
					flipAngle = 360;
				}
				if(flipAngle  > 300   && previousFlipAngle < 60  ){
					numRotations--;
				}
				else if(flipAngle  < 60   && previousFlipAngle > 300   ){
					numRotations++;
				}
				previousFlipAngle = flipAngle;
				flipAngle = 360*numRotations + flipAngle ;
				$("#pcard").css({ '-webkit-transform': 'rotate( ' + flipAngle + 'deg)', 'transform': 'rotate( ' + flipAngle + 'deg)',"transition": "all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)" });
			}
		});
	}
	function trackoff () {

		p_trackingon = false;
		$(document).unbind("swipeleft");
		$(document).unbind("swiperight");
		$(document).unbind('mousemove');
		$(document).unbind('mouseenter');
		$(document).unbind('mouseleave');
		$("#periphery_arrows").css({'z-index': '12'});
	}
	function syncTime() {
		//console.log("in periphery sync time");
		if(videoLoaded && audioNormLoaded && audioYetiLoaded) {
			var audioNorm = document.getElementById("audio_norm");
			var audioYeti = document.getElementById("audio_yeti");
			
			videoTrackCurrentPosition  = document.getElementById("target").currentTime;
			if(audioNorm.volume === 0) {
				audioNorm.currentTime = videoTrackCurrentPosition;
			}

			if(audioYeti.volume === 0) {
				audioYeti.currentTime = videoTrackCurrentPosition;
			}

			//console.log("videoCurrentPos: " + videoTrackCurrentPosition);
		}
	}
	function enableControls () {

		controlsActive = true;

		outerOuter
		.on('mouseenter', function () { if(mouseYTracking) { trackMouseRotation(); } })
		.on('mouseleave', function () {
			if(flipAngle < 90) {
				flipAngle = 0;
			} 
			else if (flipAngle >= 90 || flipAngle < 270 ) {
				flipAngle = 180;
			} else if (flipAngle >= 270) {
				flipAngle = 360;
			}
			 trackoff();
		}); 

	}

	function resetVideoRotation() {
		console.log("flipAngle Before Reset: "+ flipAngle);
		// if ((flipAngle % 180) = 0 ) {
		// 	console.log("flipAngle is 180 or multiple");
		// 	flipAngle = flipAngle;
		// } else {
		// 	console.log("flipAngle is needs to rotate");

			if((flipAngle) < 90) {
				flipAngle = 0;
			} 
			else if ((flipAngle) >= 90 || (flipAngle) < 270 ) {
				flipAngle = 180;
			} else if ((flipAngle) >= 270) {
				flipAngle = 360;
			}
		// }

		console.log("flipAngle After Reset: "+ flipAngle);

		$("#pcard").css({ '-webkit-transform': 'rotate( ' + flipAngle + 'deg)', 'transform': 'rotate( ' + flipAngle + 'deg)',"transition": "all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)" });

	}

	// function disableControls () {
	// 	outerOuter.unbind("mouseenter");
	// 	outerOuter.unbind("mouseleave");
	// 	$("#leftbutton").unbind("click");
	// 	$("#rightbutton").unbind("click");
		
	// 	trackoff();
	// 	resetVideoRotation();
	// 	controlsActive = false;
	// }

	function openScreen () {
		instructions.fadeIn(2000);
		openIvl = setTimeout(closeScreen,10000);
		instructions.on('click', function () { closeScreen(); });
	}

	function closeScreen () {
		clearInterval(openIvl);
		instructions.fadeOut(1000, function() {

			if(active && document.getElementById("target").paused) {
				playButton();
			}
			trackMouseRotation();
			if(audioactive) {
				audiostop();
			}
		});
	}

	function initVideos() {

		Object.keys(media).forEach(function (id) {
			console.log("[periphery initVideos ID ] " + id);
			if(id === 'target'){
				var video = document.getElementById(id);
				// console.log(video);

				video.addEventListener("canplay", function(){
					console.log('[ Periphery : Canplay Event ] ' + id + ' Video');
					videoLoaded= true;
				}, true);
				video.addEventListener("ended", endVideos, true);
				video.addEventListener("timeupdate", scrubberUpdater, true);
				video.addEventListener("play", function(){mouseYTracking = true;}, true);
				video.addEventListener("pause", function(){mouseYTracking = true;}, true);
				video.load();
				media[id] = video;
			}
			else{
				var audio = document.getElementById(id);
				audio.addEventListener("canplay", function(){
					console.log('[ Periphery : Canplay Event ] ' + id + ' Audio');
					if(id === 'audio_norm') {
						audioNormLoaded = true;
					} else if(id === 'audio_yeti') {
						audioYetiLoaded = true;
					}
				}, true);
				audio.load();
				media[id] = audio;
				console.log("Media: " + media);
			}

		});
	}

	function playButton(){
		if(active) {
			mouseYTracking = true;
			if(document.getElementById("target").paused){ playVideos();}
			else{ pauseVideos();}
		}
	}
	function playVideos(){
		if(audioactive){
			audiostop();
		}

		var id;
		if (!allVideosLoaded) {
			for (id in media) {
				if (media.hasOwnProperty(id)) {
					console.log('Media Readystate: ' + media[id].readyState);
					if (!media[id] || media[id].readyState < 2) {
						console.log('[ Periphery play videos] Videos not loaded');
						console.log('Media ID: ' + id);
						return;
					}
				}
			}
			allVideosLoaded = true;
		}

		for (id in media) {
			if (media.hasOwnProperty(id) && media[id]) {
				if(id === 'target'){
					media[id].volume = 0;	
				}
				media[id].play();
			}
		}
	}
	function pauseVideos(){
		for (id in media) {
			if (media.hasOwnProperty(id) && media[id]) {
				media[id].pause();
			}
		}
	}
	function restartVideos() {

		document.getElementById("target").currentTime = 0;
		document.getElementById("target").volume = 0;
		document.getElementById("audio_norm").currentTime = 0;
		document.getElementById("audio_yeti").currentTime = 0;
		document.getElementById("target").play();
		document.getElementById("audio_norm").play();
		document.getElementById("audio_yeti").play();
	}
	function scrubberUpdater (){

		var dur = Math.floor(document.getElementById("target").currentTime);
		if(dur > 0){ var ratio = (document.getElementById("target").duration / dur); }
		
		videoCurrentTime = document.getElementById("target").currentTime;

		$("#p_progress").css({ "width": (640 / ratio) + 'px' });
		
		if(document.getElementById("audio_yeti").volume > document.getElementById("audio_norm").volume ){
			sideTracker[Math.floor(document.getElementById("target").currentTime)] = 1;
		}
		else if (document.getElementById("audio_yeti").volume < document.getElementById("audio_norm").volume) {
			sideTracker[Math.floor(document.getElementById("target").currentTime)] = 2;
		}
		else {
			sideTracker[Math.floor(document.getElementById("target").currentTime)] = 0;
		}

		scrubberLength = Object.keys(sideTracker).length;
	}
	function initScrollspy(){
		instructions.scrollspy({
			min: instructions.offset().top,
			onEnter: function(element, position) {
				if(document.getElementById("target").currentTime == 0) {
					openScreen();
				}
				else {
					toggleButtonDisplay();
				}
			},
			onLeave: function(element, position) {
				instructions.fadeOut();
			}
		});
	}
	function buildEndScreen () {
		console.log("[ Periphery ] p_buildendscreen");
		container.hide();
		controls.hide();
		$("#p_endscreen").fadeIn();
		$("#p_legmore").fadeIn();
		
		// now the drawing
		var outputstring = new String();
		var nowtop = 0;
		var multiplier = 1.756;
		
		var yetiFraction = 0;
		var normFraction = 0;
		var equalFraction = 0;
		for(var i = 0; i < scrubberLength; i++){
			if( sideTracker[i] === 1){
				yetiFraction++;
			}
			else if (sideTracker[i] === 2){
				normFraction++;
			}
			else {
				equalFraction++;
			}

		}

		//adjust for time spent listening equally
		scrubberLength -= equalFraction;

		yetiFraction = yetiFraction / scrubberLength;

		var endAngle = 0;
		if (yetiFraction > 0.5 ) {
			$("#p_person_b").fadeIn();
			endAngle = map(yetiFraction, 0.5, 1, 0, -90);
		} else {
			$("#p_person_a").fadeIn();
			endAngle = map(yetiFraction, 0, 0.5, -90, 0);
		}

		$("#p_people_data").css({ '-webkit-transform': 'rotate( ' + endAngle + 'deg)', 'transform': 'rotate( ' + endAngle + 'deg)' });

		$("#p_person_overlay").click(function () {
			sideTracker = {};
			$("#p_endscreen").fadeOut();
			$("#p_legmore").fadeOut();
			

			document.getElementById("target").currentTime = 0;
			document.getElementById("audio_norm").currentTime = 0;
			document.getElementById("audio_yeti").currentTime = 0;

			container.fadeIn();
			controls.fadeIn();
			playVideos();

			$("#p_playElement").css({'background':'url(/periphery/art/playWhite.png)'})
		});
	}

	function endVideos(){
		pauseVideos();
		buildEndScreen();
	}

	function attachEvents() {
		//console.log("[ Periphery Events ] Attach Periphery Events");

		$("#p_playElement").on('click', function () {
			//console.log("[Attach Periphery Events: p_playElement ] p_playButton");
			playButton();
			if( !document.getElementById("target").paused ){
				toggleButtonDisplay();
			}

		}).on('mouseover', function (){
			if(document.getElementById("target").paused){
				$("#p_playElement").css({'background':'url(../art/periphery/playWhite.png)'})
			} else {
				$("#p_playElement").css({'background':'url(../art/periphery/pauseWhite.png)'})
			}
		}).on('mouseout', function (){
			if(document.getElementById("target").paused){
				$("#p_playElement").css({'background':'url(../art/periphery/playRed.png)'})
			} else {
				$("#p_playElement").css({'background':'url(../art/periphery/pauseRed.png)'})
			}
		});

		$("#p_play_bg").on('click', function() {
			//console.log("[Attach Periphery Events: p_play_bg ] p_playButton");
			playButton();
			toggleButtonDisplay();
		});

		$("#p_refresh").on('click', function() {
			restartVideos();
		});

	  	$("#cradle_pbutton").on('click', function() {
	  		//console.log("[ attach Periphery Events ] cradle_pbutton - p_pauseVids");
	  		pauseVideos();
	  		resetVideoRotation();

	  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000,function() {
	  			animateButton(0);
	  		});
	  	});

	  	$("#legacy_pbutton").on('click', function() {
	  		//console.log("[ attach Periphery Events ] legacy_pbutton - p_pauseVids");
	  		pauseVideos();
	  		resetVideoRotation();
	  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000, function() {
	  			animateButton(1);
	  		});
	  	});

	  	$("#migrants_pbutton").on('click', function() {
	  		//console.log("[ attach Periphery Events ] migrants_pbutton - p_pauseVids");
	  		pauseVideos();
	  		resetVideoRotation();
	  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000, function() {
	  			animateButton(2);
	  		});
	  	});
	}
	function init(){
		instructions = $("#p_instructions");
		outerOuter = $("#p_outerouter");
		container = $("#p_container");
		peripheryContent = $("#peripheryContent");
		controls = $("#p_controls");
		initScrollspy();
		peripheryContent.css({'width': '100%', 'height': '100%'});
		
		attachEvents();
		sizer();

		lazywidth = outerOuter.width();
		enableControls();
		
	}

	var periphery ={
		sizer:sizer,
		init:init,
		active:function(){
			return active;
		},
		activate:function(){
			
			peripheryContent.fadeIn(2000);
		 	if(firstTime) {
				peripheryContent.css({'width': '100%', 'height': '100%'});
				$(".periphery_top").css({'background': 'none'});
				sizer();
				initVideos();
				lazyHeight = $("#p_outerouter").height();
				currentVideoId = 'target';
				enableControls();
		 		firstTime = false;
		 	}

		 	active = true;
		 	if( document.getElementById("target") ) {
				if( document.getElementById("target").currentTime > 0 ) {
				 	toggleButtonDisplay();
				 }
			}
		},
		deactivate:function(){
			peripheryContent.fadeOut("fast");
		 	pauseVideos();
		 	active = false;

		}
	}

	window.periphery = periphery;
	
}(this));
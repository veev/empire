(function(window) {
	var firstTime = true;
	var active = false;
	var showProgress = false;
	var allVideosLoaded = false;
	var currentVideoPosition = 0;
	var currentTime = 0;
	var maxVolume = 20;
	var currentVolume = 0;
	var intervalID = 0;
	var amount = 0;
	var insructIvl;
	var prevVenID = -1;
	var timecodeArray = [];
	var actFillArray = [];
	var maxTimeOfDay = 24*60*60;
	var width;
	var height;
	var radius;
	var archtype;
	var holderWidth;
	var total_arc;
	var progress_arc;
	var time_arc;
	var time_progress_arc = null;
	var test_arcseg;
	var instructionsOff = false;
	var progrssCircle;
	var initPathPos = 0;
	var initPathNewPos = 0;
	var vennMap;
	var timeCircle = null;
	var watchedFullMigrants = false;
	var shouldShowVideo = false;
	var mTrackerArray = [];
	var downloadMigrants = false;
	var returnMigrants = false;
	var fakeProgress = 30;
	var originCrossed = false;
	var previousPos = 0;
	var remoteClock;
	var migrantsVideo;

	var migrantsContent,migrantsTop, container, holder;

	'use-strict';
	function map(i, sStart, sEnd, tStart, tEnd) {
			var v = i-sStart;
			if (v>=0) {
					if (i < sStart) { return tStart;}
					else if (i > sEnd) {return tEnd;}
			} else {
					if (i < sStart) {return tStart;}
					else if (i < sEnd){return tEnd;}
			}
			var sRange = sEnd - sStart;
			if (sRange == 0) {return tStart;}
			var tMax = tEnd - tStart;
			return tStart + v / sRange * tMax;
	}

	/*
	Copy the list of which segments of the video have been viewed and save it to localStorage
	*/
	function saveTrackerArray() {
		var saved = [],
			mTracker,
			i;

		for (i = 0; i < mTrackerArray.length; i++) {
			mTracker = mTrackerArray[i];
			saved.push({
				startPos: mTracker.startPos,
				endPos: mTracker.endPos
			});
		}

		try {
			localStorage.setItem('mTrackerArray', JSON.stringify(saved));
		} catch (e) {}
	}

	/*
	Load list of viewed segments from loadStorage
	*/
	function loadTrackerArray() {
		var saved,
			mTracker,
			savedTracker,
			i;

		if (mTrackerArray.length) {
			return;
		}

		try {
			saved = JSON.parse(window.localStorage.getItem('mTrackerArray'));
		} catch (e) {
			return;
		}

		if (saved && Array.isArray(saved)) {
			for (i = 0; i < saved.length; i++) {
				savedTracker = saved[i];
				mTrackerArray.push({
					isActive: false,
					startPos: savedTracker.startPos,
					endPos: savedTracker.endPos,
					isCrossOriginArc: true,
					arcSegment: null
				});
			}
			loadArcSegs();
		}
	}

	/*
	Initialize position of progress arc
	*/
	function progressArcInitPos(){
		var initPos;
		var initDur = getCurrentTime();
		height = migrantsTop.height();
		if(initDur > 0){
			initPos = ( initDur / migrantsVideo.duration);
			initPathNewPos = initPos*360;
			initPos *= 100;
			initPathPos = initPos;
		}

	}

	function loadArcSegs(){
		for (var i = 0; i < mTrackerArray.length; i++) {
			if(mTrackerArray[i].arcSegment === null){
				mTrackerArray[i].arcSegment = archtype.path();
				var transformArc = "r-90,"+(width/2)+","+(height/2);
				mTrackerArray[i].arcSegment.transform(transformArc);
			}
		}
	}

	/*
	so arc draws on resizing page
	*/
	function refreshArcSegs(){
		for (var i = 0; i < mTrackerArray.length; i++) {
			mTrackerArray[i].arcSegment = archtype.path();
			var transformArc = "r-90,"+(width/2)+","+(height/2);
			mTrackerArray[i].arcSegment.transform(transformArc);
		}
	}
	/*
	Get Raphael dimensions to account for scaling issues
	*/
	function getDimensions() {
		height = migrantsTop.height();
		holderWidth = migrantsTop.width() * 0.595;
		if (holderWidth < height) {
			holderWidth = height * 1.1; //reason that arcs are drawing slightly smaller radius than progress circle?
		}
		radius = height - 40;
		archtype = Raphael("holder", holderWidth, height);
		width = holderWidth;
		//console.log("[ Migrants getDimensions: width, height ] " + width + ", " + height);
	}

	/*
	Initialize paths
	*/
	function initPaths() {
		total_arc = archtype.path();
		progress_arc = archtype.path();
		time_arc = archtype.path();
		time_progress_arc = archtype.path();
		test_arcseg = archtype.path();

		timeCircle = archtype.circle(width/2,0,0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u');
		progrssCircle = archtype.circle(width/2, 0, 0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u');

		var startLine = archtype.path("M"+ width/2 +" 40 L"+width/2+" 60").attr({stroke: '#fff', "stroke-width": '1','stroke-opacity': '0.6'});
		var twentyfour = archtype.text(width/2, 10, '24h');
			twentyfour.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'});
		var six = archtype.text(width/2 + radius/2 + 17, height/4 + 2, '6h');
			six.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'});
		var twelve = archtype.text(width/2, height/2, '12h');
			twelve.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'});
		var eighteen = archtype.text(width/2 - radius/2 - 17, height/4 + 2 , '18h');
			eighteen.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'});
		var durationTime = archtype.text(width/2, 38, '20m:50s');
			durationTime.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'});
		var sixDot = archtype.circle(width/2 + radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});
		var twelveDot = archtype.circle(width/2, radius + 20, 1).attr({fill: '#FFFFFF', stroke: '#fff','opacity': '0.6'});
		var eighteenDot = archtype.circle(width/2 - radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});

		archtype.customAttributes.arcseg = function( cx, cy, radius, start_r, finish_r ) {
			var start_x = cx + Math.cos( start_r ) * radius,
				start_y = cy + Math.sin( start_r ) * radius,
				finish_x = cx + Math.cos( finish_r ) * radius,
				finish_y = cy + Math.sin( finish_r ) * radius,
				path;

			path =
			[
				[ "M", start_x, start_y ],
				[ "A", radius, radius, finish_r - start_r,
						finish_r - start_r > Raphael.rad( 180 ) ? 1 : 0,	/* large-arc-flag */
						finish_r > start_r ? 1 : 0,		/* sweep-flag */
						finish_x, finish_y ],			/* target coordinates */
			];
			return { path: path };
		};

		archtype.customAttributes.arc = function (xloc, yloc, value, total, R) {
		var alpha = 360 / total * value,
			a = (90 - alpha) * Math.PI / 180,
			x = xloc + R * Math.cos(a),
			y = yloc - R * Math.sin(a),
			path;
		if (total == value) {
			path = [
				["M", xloc, yloc - R],
				["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
			];
		} else {
			path = [
				["M", xloc, yloc - R],
				["A", R, R, 0, +(alpha > 180), 1, x, y]
			];
		}
		return {
			path: path
			};
		};

		//get time of day for 24hr circle (clock)
		var d = new Date();
		var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();
		var timeProgress = map(currentTimeOfDay, 0, maxTimeOfDay, 0, 100);

		test_arcseg.attr({
			stroke: "#f00",
			'stroke-width': 2,
			arcseg: [ width/2, height/2, height/2 - 50, Raphael.rad( initPathNewPos ), Raphael.rad( initPathNewPos) ]
		});

		var transformArc = "r-90,"+(width/2)+","+(height/2);
		test_arcseg.transform(transformArc);

		total_arc.attr({
			"stroke": "#fff",
			"stroke-width": 1,
			arc: [width/2, height/2, 100, 100, height/2 - 50]
		});

		time_arc.attr({
			"stroke": "#888",
			"stroke-width": 2,
			'fill': 'none',
			"stroke-miterlimit": 10,
			"stroke-dasharray": '.',
			//arc: [width/2, height/2, 100, 100, height/2-30 ]
			arcseg: [width/2, height/2,  height/2-30,Raphael.rad(0), Raphael.rad(359) ]
		});

		//white time marks = amount of screenings per day
		var insructIvl;
		var prevVenID = -1;
		var timecodeArray = [];
			var spacing = 69;
			var r1 = radius/2 - 14,
				r2 = radius/2 - 4,
				cx = width/2,
				cy = height/2;

		for (var i=0; i < spacing; i++) {
				//so they match current time (make last one at a bit before origin)
				var circleSegment = map(i, 0, spacing, 0, 359.6);
				cos = Math.cos( Raphael.rad (circleSegment - 90));
				sin = Math.sin(Raphael.rad (circleSegment - 90));
				var sector = archtype.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]])
					.attr({stroke: '#fff', 'opacity': '0.9',  'stroke-width': '0.8'});
		}

		time_progress_arc.attr({
			"stroke": "#fff",
			"stroke-width": 2,
			'fill': 'none',
			"stroke-miterlimit": 10,
			"stroke-dasharray": '.',
			arc: [width/2, height/2, timeProgress, 100, height/2 -30]
		});

		arrayActFills();
	}

	function initScrollSpy(){
		instructions.scrollspy({
			min: instructions.offset().top,
			onEnter: function(element, position) {
				if(active) {
					console.log("entering m_instructions");
					openScreen();
					//vennTracking();
				}


			},
			onLeave: function(element, position) {
				console.log("leaving m_instructions");
				instructions.fadeOut();
				//trackoff();
			}
		});
	}


	function init(){
		
		migrantsVideo = document.getElementById("migrants_video");
		migrantsVideoJqry = $("#migrants_video");
		migrantsContent =$("#migrantsContent");
		migrantsTop = $("#migrants_top");
		instructions = $("#m_instructions");
		container = $("#m_container");
		holder = $("#holder");

		remoteClock = new RemoteClock('http://digital.pov.org:8080/time-server/', function () {
			if (migrantsVideo.duration) {
				migrantsVideo.currentTime = getCurrentTime();
			}
		});

		initScrollSpy();
		getDimensions();
		initPaths();
		addListeners();
		attachEvents();
	}

/*
	Gets called every frame to update arc position and tracker array
*/
	function circleScrubber() {

		if(!active){
			return;
		}

		loadTrackerArray();

		var d = new Date();
		var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();
		var maxTimeOfDay = 24*60*60;

		var timeProgress = map(currentTimeOfDay, 0, maxTimeOfDay, 0, 100);

		if(time_progress_arc !== null){
			time_progress_arc.attr({
				"stroke": "#fff",
				"stroke-width": 2,
				arc: [width/2, height/2, timeProgress, 100, height/2 - 30]
			});
		}

		var circleStartPos = 0;
		var circleFinishPos = 0;
		var totalArcLength = 0;
		var activeArcs = false;
		checkArcLength();
		saveTrackerArray();

		for (var i = 0; i < mTrackerArray.length; i++) {
			if(mTrackerArray[i].arcSegment !== null){

				if(mTrackerArray[i].isActive){
					activeArcs = true;
					mTrackerArray[i].endPos = getMigrantsVideoCurrentPos();

					if (previousPos >359.7 && mTrackerArray[i].endPos < 0.5) {
						console.log(mTrackerArray.length);
						if(mTrackerArray[i].isCrossOriginArc === false){
							mTrackerArray[i].endPos = 359.9;
							mTrackerArray[i].isActive = false;
							mTrackerArray.push({
								isActive: true,
								startPos: 0,
								endPos: 0,
								isCrossOriginArc: true,
								arcSegment: null
							});
							loadArcSegs();
						}
					}
					else {
						mTrackerArray[i].arcSegment.attr({
						"stroke": "#ff5a00",
						"stroke-width": 2,
						arcseg: [ width/2, height/2, height/2 - 50, Raphael.rad( mTrackerArray[i].startPos ), Raphael.rad(mTrackerArray[i].endPos) ]
						});
					}
					previousPos = mTrackerArray[i].endPos;
				}
				else{
					mTrackerArray[i].arcSegment.attr({
						"stroke": "#ff5a00",
						"stroke-width": 2,
						arcseg: [ width/2, height/2, height/2 - 50, Raphael.rad( mTrackerArray[i].startPos ), Raphael.rad( mTrackerArray[i].endPos) ]
					});
				}

			}
		}

		if(!activeArcs){
			// console.log("activeArcs : " + activeArcs);
			var currentPos =  getMigrantsVideoCurrentPos();
			for (var i = 0; i < mTrackerArray.length; i++) {
				// console.log("mTrackerArray[i].startPos: " + mTrackerArray[i].startPos);
				// console.log("mTrackerArray[i].endPos: " + mTrackerArray[i].endPos);
				// console.log("currentPos: " + currentPos);
				if( currentPos > mTrackerArray[i].startPos && currentPos < mTrackerArray[i].endPos ) {
					console.log("Drawing over another inactive arc");
				} else {
					//create an arc to "fill in the gap in the session"
					mTrackerArray.push({
						isActive: true,
						startPos: currentPos,
						endPos: currentPos,
						isCrossOriginArc: false,
						arcSegment: null
					});
					loadArcSegs();
					break;
				}
			}

		}

		if (checkArcLength()) {
			downloadMigrants = true;
			console.log("You Can Now Download Migrants" );
		}

		var xloc_ = width/2;
		var yloc_ = height/2;
		var R_ = height/2 - 30;

		var alpha_ = 360 / 100 * timeProgress;
		var a_ = (90 - alpha_) * Math.PI / 180;
		var x_ = xloc_ + R_ * Math.cos(a_);
		var y_ = yloc_ - R_ * Math.sin(a_);

		circleFinishPos  = getMigrantsVideoCurrentPos();

		if(timeCircle !== null){
			timeCircle.animate({cx:x_,cy:y_,r:4},100);
		}

		var ration = getMigrantsVideoCurrentPos();

		if(ration > 0){
			var _cx = width/2;
			var _cy =  height/2;
			var _r =  height/2 - 50;

			var cur_x = _cx + Math.cos( Raphael.rad( circleFinishPos - 90 ))  * _r;
			var cur_y = _cy + Math.sin( Raphael.rad( circleFinishPos - 90 ))  * _r;

			if(showProgress) {
				progrssCircle.animate({cx:cur_x,cy:cur_y,r:6}, 10);
				progrssCircle.toFront();
			}

		}
	}
	function openScreen () {
		var d = new Date();
		console.log("in migrants openscreen " + d.getSeconds());
		instructionsOff = false;

		if (!audioactive) {
			audioready();
		}

		if(allVideosLoaded){
			fadeInMigrantsVideo();
		}
		else{
			shouldShowVideo = true;
		}

		holder.fadeIn(4000, function() {
			holder.css({'cursor' : 'default', 'pointer-events' : 'none', 'opacity': 1.0, 'z-index': 100});
			instructions.fadeIn(4000).css({'cursor' : 'default'});
		});
		insructIvl = setTimeout(closeScreen,10000);
	}

	function closeScreen() {
		migrantsVideoJqry.animate({opacity: "1"},1000);
		if(instructionsOff){
			return;
		}

		clearInterval(insructIvl);

		if (audioactive) {
			audiostop();
		}
		migrantsVideo.volume = 0;
		instructions.fadeOut(2000);
		holder.css({'cursor': 'default'}).fadeOut(3000, function() {
			if(intervalID !== 0 ){
				clearTimeout(intervalID);
			}
			// fadeInMigrantsVideoAudio();
			intervalID = setInterval(fadeInMigrantsAudio,100);
			showProgress = true;
			instructionsOff = true;
			console.log("Migrants In Holder FadeOut");
		});
	};

	function getMigrantsVideoCurrentPos(){
		var initPos;
		var initDur = getCurrentTime();
		height = migrantsTop.height();

		ration = ( initDur / migrantsVideo.duration);
		ration *= 360;
		return ration;
	}

	function sizer() {
		var w = $("#migrants_top").width();
		var h = $("#migrants_top").height();
		//console.log("[ migrants w, h] " + w + ", " + h);
		var padtop = h * 0.1; // top of the main title
		var matop = padtop * 1.5; // top of the matrix
		var legbottom = 50; //offset of the bottom play button on the open screen
		var buffer = h - legbottom;
		var centering = (w/2) - 62;
		if($(".migrants_top:first").height() < 780){ // if this a wee screen
			padtop = 20;
			matop = h * 0.15;
			legbottom = 20;
		}

		$("#migrants_title").css({ 'padding-top': padtop, 'height' : matop });

		$("#mainarea").css({ "margin-top": 20 });
		$(".vertical_line").css({ 'height' : h });
		$("#migrants_wline1").css({ 'height': h });
		$("#migrants_wline2").css({ 'height': h });
		$("#migrants_wline3").css({ 'height': h });
		$("#m_legmore").css({ "margin-left": ($("#migrants_main").width() / 2) - 90 });
		$("#minst_2").css({"top": h*0.15});
		$("#minst_3").css({"top": h*0.84});

		if (h < 710) {
			$("#m_a").css({"padding-left": 42, "top": -8});
			$("#m_a2").css({"padding-left": 505, "top": 16});
		} else if (h >= 710 && h < 800) {
			$("#m_a").css({"padding-left": 42, "top": -24});
			$("#m_a2").css({"padding-left": 505, "top": 10});
		} else {
			$("#m_a").css({"padding-left": 42, "top": -24});
			$("#m_a2").css({"padding-left": 505, "top": 10});
		}
		//fix scaling
		var tempHolderWidth;
		tempHolderWidth = w * 0.595;
		if (tempHolderWidth < h) {
			tempHolderWidth = h * 1.1;
		}

		tempHolderWidth = Math.ceil(tempHolderWidth);

		holder.css({"width" : tempHolderWidth});
		$("#m_download").css({"left": ($("#m_outerinner").width()*0.465) , "top" : (h/2) - 44 });
		$("#migrantsmore").css({"top": buffer, "left": centering });
	}

	function vennTracking() {
		var timer;
		container.on({
			'mousemove': function () {
				if(instructionsOff && !downloadMigrants) {
					vennMapOn();
					vennMapIsOn = true;
				}
				clearTimeout(timer);
				timer = setTimeout(function () {
					if(instructionsOff && !downloadMigrants) {
						vennMapOff();
						vennMapIsOn = false;
					}
				}, 5000);
			},
			'mouseout' : function () {
				if(instructionsOff && !downloadMigrants) {
					vennMapOff();
					vennMapIsOn = false;
				}
				clearTimeout(timer);
			}
		});
	}

	var vennMapOn = function() {
		if ( holder.is(":visible") === false){
		migrantsVideoJqry.animate({
			'z-index': 10
		}, 800);

		holder.fadeIn(800).css({'z-index': 20});
		}

	};

	var vennMapOff = function() {
		if ( holder.is(":visible") === true){
			migrantsVideoJqry.animate({
				'z-index': 20
			}, 800);
			holder.fadeOut(800).css({'z-index': 10});
		}
	};
	function audioToggle() {
		if(active) {
			var showProgress = false;
			console.log("[ AudioToggle ] Audio Volume is: "+ migrantsVideo.volume);
			if(migrantsVideo.volume > 0){
				migrantsVideo.volume = 0;
			}
			else{
				migrantsVideo.volume = 0.25;
			}
		}
	}

	function fadeInMigrantsVideo(){
		document.getElementById('migrants_video').volume = 0;
		playButton();
		$("#migrants_video").animate({opacity: "0.5"},4000);
	}

	function loadTimecodeData(data){
		var localArray = [];
		for (var i = 0; i < data.length; i++) {

			for(var j =0; j<data[0].Timecode.length; j++){
				localArray.push(data[0].Timecode[j]);
			}
		}

		return localArray;

	}

	function jsonCall() {
		console.log(m_url);
		m_url = "/timecode.json";
		var data = $.parseJSON($.ajax({
			url:  m_url,
			dataType: "json",
			async: false
		}).responseText);
		return data;
	}

	function migrants_audiostop () {
		clearInterval(intervalID);
		intervalID = setInterval(fadeOutMigrantsAudio,100);
		audioactive = false;
	}

	var fadeInMigrantsAudio = function () {
		console.log("In fadeInMigrantsAudio");
		// internal function to fade outaudio
		// console.log(migrantsVideo);
		// console.log(migrantsVideo.volume);
		// migrantsVideo.volume = currentVolume / 100;
		// currentVolume += 1;
		// if(_currentaudiovolume === 0){
		// 	clearInterval(intervalID);
		// 	document.getElementById('ambientaudio').pause();
		// }
		// intervalID = setTimeout(fadeInMigrantsAudio, 100);

		// internal function to fade in
		document.getElementById('migrants_video').volume = currentVolume / 100;
		currentVolume += 3;
		if(currentVolume > maxVolume){
			clearInterval(intervalID);
		}
	};

	var fadeOutMigrantsAudio = function () {

		// internal function to fade outaudio
		migrantsVideo.volume = currentVolume / 100;
		currentVolume -= 1;
		if(_currentaudiovolume === 0){
			clearInterval(intervalID);
			ambientAudio.pause();
		}
	};

	function m_trackoff() {
		instructions.unbind('click');
		holder.unbind('click');
		container.unbind('mousemove');
		container.unbind('mouseout');
	}

	function videoPlaying() {
		var targetTime = getCurrentTime();
		if (Math.abs(migrantsVideo.currentTime - targetTime) > 0.3) {
			migrantsVideo.currentTime = getCurrentTime();
		}
	}

	function attachEvents() {
		$("#cradle_mbutton").on('click', function() {
			$('html body').animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(0);
			});
		});

		$("#legacy_mbutton").on('click', function() {
			$('html body').animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(1);
			});
		});

		$("#periphery_mbutton").on('click', function() {
			$('html body').animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(3);
			});
		});

		var body = $('html body');
		$("#migrantsmore").fadeIn(4000).on('click', function() {
			body.animate({scrollTop: ($('#migrants_main').offset().top) }, 1000);
			openScreen();
		});
	}

	function addListeners() {
		//console.log(timecodeArray);
		migrantsVideo.addEventListener("canplay", loadVideo, true);
		migrantsVideo.addEventListener("ended", endVideos, true);
		migrantsVideo.addEventListener("seeked", m_hasLooped, true);
		migrantsVideo.addEventListener("timeupdate", scrubberUpdater, true);
		migrantsVideo.addEventListener("playing", videoPlaying, false);
	}

	function m_hasLooped() {
		console.log("migrants has played and restarted");
	}

	function loadVideo() {
		console.log('[ Migrants : Canplay Event ] Video Loaded' );
		allVideosLoaded = true;
		progressArcInitPos();

		if(active && migrantsVideo.paused) {
			var showProgress = false;
			playButton();
			migrantsVideo.volume = 0;
		} else {
			//console.log("[loadVideo] migrants page not active but video loaded");
		}
		if($("#migrants_video").css("display") === "none" && shouldShowVideo){
			fadeInMigrantsVideo();
		}
	}

	function playButton() {
		if(active) {
				if(migrantsVideo.paused){
					playVideos();
				}
		}
	}

	function playVideos() {

		if(allVideosLoaded){
				var cTime = getCurrentTime();
				migrantsVideo.currentTime =cTime;
				migrantsVideo.play();
				circleScrubber();
		}
	}

	function getCurrentTime(){
		var d,
			currentTimeOfDay,
			currentTimeForVideo;

		if (remoteClock && remoteClock.accuracy() <= 500) {
			d = new Date(remoteClock.time());
		} else {
			d = new Date();
		}

		currentTimeOfDay = d.getHours()*60*60 + (d.getMinutes())*60 + d.getSeconds();
		currentTimeForVideo = currentTimeOfDay % migrantsVideo.duration;
		return currentTimeForVideo;

	}

	function pauseVideos(){

		currentTime =  migrantsVideo.currentTime ;
		currentVideoPosition  = migrantsVideo.currentTime;
		//console.log("[ Migrants : pauseVideos ] currentVideoPosition = " + currentVideoPosition);
		migrantsVideo.pause();
	}


	function endVideos() {
		pauseVideos();
	}

	function downloadScreen() {

		$("#m_endscreen").fadeIn();
		for(var j=0; j<actFillArray.length; j++){
			actFillArray[j].actFill.animate({opacity: '1.0', fill: '#ff5a00'}, 800);
		}
		vennMap[10].attr({fill: '#000', opacity: '0'});
		vennMap[11].attr({fill: '#000', opacity: '0'});
		vennMap[12].attr({fill: '#000', opacity: '0'});
		vennMapOn();

	}

	function returnToMigrants() {
		$("#m_endscreen").fadeOut();
		for(var j=0; j<actFillArray.length; j++){
			actFillArray[j].actFill.animate({opacity: '0', fill: '#ff5a00'}, 800);
		}
		vennMap[10].attr({fill: '#000', opacity: '1'});
		vennMap[11].attr({fill: '#000', opacity: '1'});
		vennMap[12].attr({fill: '#000', opacity: '1'});
		vennMapOff();
	}

	//Called every frame
	var scrubberUpdater = function () {

		var dur = Math.floor(migrantsVideo.currentTime);
		if(dur > 0){
			var ratio = (migrantsVideo.duration / dur);
		}
		if(showProgress){
			if(mTrackerArray.length === 0) {
				var currentPos = getMigrantsVideoCurrentPos();
				mTrackerArray.push({
					isActive: true,
					startPos: currentPos,
					endPos: currentPos,
					arcSegment: null,
					isCrossOriginArc: false
				});
				loadArcSegs();
			}
			circleScrubber();
		}

		currentTime = migrantsVideo.currentTime;

		if(instructionsOff) {

			for (var i = 0; i < timecodeArray.length; i++) {

				if( currentTime < timecodeArray[i].Maxtime ){
					
					if( timecodeArray[i].Venn !== prevVenID){

						for(var j=0; j<actFillArray.length; j++){

							if(actFillArray[j].vennID === timecodeArray[i].Venn){
								//Turn on act Fill
								actFillArray[j].actFill.animate({opacity: '1.0'}, 800);
								vennMap[10].attr({'opacity': '1'});
								vennMap[11].attr({'opacity': '1'});
								vennMap[12].attr({'opacity': '1'});

								//Ghana Label
								if(actFillArray[j].vennID === 0) {
									vennMap[10].attr({fill: '#000'});
								} else if (actFillArray[j].vennID === 1 || actFillArray[j].vennID === 5 || actFillArray[j].vennID === 6 ) {
									vennMap[10].attr({fill: '#ff5a00'});
								} else {
									vennMap[10].attr({fill: '#fff'});
								}

								//Brazil Label
								if(actFillArray[j].vennID === 4) {
									vennMap[11].attr({fill: '#000'});
								} else if ( actFillArray[j].vennID === 3 || actFillArray[j].vennID === 5 || actFillArray[j].vennID === 6  ) {
									vennMap[11].attr({fill: '#ff5a00'});
								} else {
									vennMap[11].attr({fill: '#fff'});
								}

								//Suriname Label
								if (actFillArray[j].vennID === 2) {
									vennMap[12].attr({fill: '#000'});
								} else if ( actFillArray[j].vennID === 1 || actFillArray[j].vennID === 3 || actFillArray[j].vennID === 6 ) {
									vennMap[12].attr({fill: '#ff5a00'});
								} else {
									vennMap[12].attr({fill: '#fff'});
								}

							}else{
								actFillArray[j].actFill.animate({opacity: '0.0'}, 400);
							}
						}
						prevVenID = timecodeArray[i].Venn;
					}
					break;
				}
			}
		}
		else {
			//console.log("Instructions are on. No fills");
		}

		if(downloadMigrants) {
			downloadScreen();
			instructionsOff = false;
		}

		if (returnMigrants) {
			returnMigrants = false;
			instructionsOff = true;
			prevVenID = -1;
			returnToMigrants();
		}
	};

	function Fill(_actFill, _vennID) {
		this.actFill = _actFill;
		this.vennID = _vennID;
	}

	function arrayActFills() {

		vennMap = archtype.set();

		var ghan = archtype.path("M151.016,14.703C107.713-8.178,47.436-0.706,16.925,51.2c-30.768,52.341-5.337,112.775,35.211,136.491c0,0-4.502-54.25,48.776-85.542l0,0C102.103,39.941,151.016,14.703,151.016,14.703z");
			ghan.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '0');
		var ghana_label = archtype.text(60, 25, 'Ghana');
			ghana_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'});
		var fill_0 = new Fill(ghan, 0);
		actFillArray.push(fill_0);

		var braz = archtype.path("M154.553,14.703C197.858-8.178,258.134-0.706,288.645,51.2c30.768,52.341,6.904,111.189-33.646,134.904c0,0,2.31-54.126-50.968-85.417l0.04,0.289C202.881,38.768,154.553,14.703,154.553,14.703z");
			braz.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '4');
		var brazil_label = archtype.text(240, 25, 'Brazil');
			brazil_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'});
		var fill_4 = new Fill(braz, 4);
		actFillArray.push(fill_4);

		var suri = archtype.path("M54.016,190.624c2.112,48.932,38.661,96.314,98.65,97.459c60.5,1.154,100.263-50.859,100.263-97.834c0,0-46.332,29.789-100.241-0.4l0,0C98.39,220.228,54.016,190.624,54.016,190.624z");
			suri.attr({opacity: '1.0',fill: '#ff5a00', stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '2');
		var suriname_label = archtype.text(150, 130, 'Suriname');
			suriname_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'});
		var fill_2 = new Fill(suri, 2);
		actFillArray.push(fill_2);

		var ghan_suri = archtype.path("M54.049,188.727c0,0-2.962-54.283,46.964-84.548c0,0-1.597,54.445,49.528,84.737C150.542,188.916,107.244,217.944,54.049,188.727z");
			ghan_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '1');

		var fill_1 = new Fill(ghan_suri, 1);
		actFillArray.push(fill_1);

		var braz_suri = archtype.path("M252.929,188.042c0,0-46.623,28.983-97.796,0.877c0,0,48.898-27.42,48.553-86.418C203.686,102.5,251.637,127.364,252.929,188.042z");
			braz_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '3');

		var fill_3 = new Fill(braz_suri, 3);
		actFillArray.push(fill_3);

		var ghan_braz = archtype.path("M152.602,15.72c0,0,48.271,25.799,49.519,84.169c0,0-48.351-29.993-98.954,0.922C103.167,100.812,100.701,47.178,152.602,15.72z");
			ghan_braz.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '5');

		var fill_5 = new Fill(ghan_braz, 5);
		actFillArray.push(fill_5);

		var ghan_braz_suri = archtype.path("M102.974,103.196c53.163-30.742,99.005-1.572,99.005-1.572c-2.126,62.971-49.312,86.066-49.312,86.066C102.952,158.226,102.974,103.196,102.974,103.196z");
			ghan_braz_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '6');

		var fill_6 = new Fill(ghan_braz_suri, 6);
		actFillArray.push(fill_6);

		var ghan_braz_suri_off = archtype.path("M102.974,103.196c53.163-30.742,99.005-1.572,99.005-1.572c-2.126,62.971-49.312,86.066-49.312,86.066C102.952,158.226,102.974,103.196,102.974,103.196z");
			ghan_braz_suri_off.attr({opacity: '0.0',fill: 'none',stroke: 'none',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '0', 'opacity': '0'}).data('id', '7');
		var fill_7 = new Fill(ghan_braz_suri_off, 7);
		actFillArray.push(fill_7);

		var circle_u = archtype.circle(102.349, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'vennMap','stroke-opacity': '1'}).data('id', 'circle_u');
		vennMap.attr({'name': 'vennMap'});
		var group_b = archtype.set();
		var circle_v = archtype.circle(202.858, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'group_b','stroke-opacity': '1'}).data('id', 'circle_v');
		group_b.attr({'name': 'group_b'});
		var group_c = archtype.set();
		var circle_w = archtype.circle(153.553, 188.729, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.',parent: 'group_c','stroke-opacity': '1'}).data('id', 'circle_w');
		group_c.attr({'name': 'group_c'});
		var holderGroups = [vennMap, group_b, group_c];

		vennMap.push( circle_u, circle_v, circle_w, ghan, braz, suri, braz_suri, ghan_suri, ghan_braz, ghan_braz_suri, ghana_label, brazil_label, suriname_label, ghan_braz_suri_off );

		var centerW = width/4;
		var centerH = height/4;
		var holderRatio = height/width;

		var mapCenter;
		var mapScalar = map(height, 600, 1200, 1.15, 2.0);

		//scaling fixes
		if ( holderRatio >= 0.9) {
			centerW = width/4 * 1;
			centerH = height/4 * 1;
			vennMap.transform("T " + centerW + " " + centerH + "S" + mapScalar + ","+ mapScalar +"," + centerW + "," + centerH);

		} else if (height < 710 && holderRatio < 0.9) {

			mapCenter = map(holderRatio, 0.6, 0.9, 1.3, 1.0);
			centerW = width/4 * mapCenter;
			centerH = height/4 * 1;
			vennMap.transform("T " + centerW + " " + centerH + "S" + mapScalar + ","+ mapScalar +"," + centerW + "," + centerH);

		} else if (height >= 710 && holderRatio < 0.9) {

			mapCenter = map(holderRatio, 0.6, 0.9, 1.4, 1.0);
			centerW = width/4 * mapCenter;
			centerH = height/4 * 1;
			vennMap.transform("T " + centerW + " " + centerH + "S" + mapScalar + ","+ mapScalar +"," + centerW + "," + centerH);
		}

	}

	function checkArcLength(){

		var fullRange = [];

		//treating the movie like it consists of 360 steps.
		for (var i = 0; i < mTrackerArray.length; i++) {

			//find the range that has been watched in arc [i] and add it to the full range
			//i.e is startPos is 10 and endPos is 20
			// curRange [10,11,12,13,14,15,16,17,18,19,20]

			var curRange   = _.range(Math.ceil(mTrackerArray[i].startPos), Math.ceil(mTrackerArray[i].endPos), 1);

			//max value is 64620

			//append curRange to the fullRange i.e range of all arcs combined
			fullRange.push(curRange);
		}

		//remove duplicate steps that have been watched. This removes overlap
		fullRange = _.flatten(fullRange);
		fullRange = _.uniq(fullRange);
		//console.log(fullRange);

		//add them all up to see how much has been watched
		var totalAmtWatched = _.reduce(fullRange, function(memo, num){ return memo + num; }, 0);

		//console.log("totalAmtWatched: " + totalAmtWatched);

		if (totalAmtWatched >= 64620) {
			return true;
		} else {
			return false;
		}

	}

	function blockMenu() {
	  var blockContextMenu;

	  blockContextMenu = function (evt) {
		evt.preventDefault();
	  };
	  migrantsVideo.addEventListener('contextmenu', blockContextMenu);
	  //console.log("context menu block");
	}
	var migrants = {
		init:init,
		sizer:sizer,
		active:function(){
			return active;
		},
		activate:function(){
			migrantsContent.fadeIn(2000);
			if(firstTime){
				migrantsContent.css({ 'width' : '100%', 'height' : '100%' });
				$(".migrants_top").css({ 'background' : 'none'});
				// init();\
				//add Migrants JSON file
				var data = jsonCall();
				timecodeArray = loadTimecodeData(data);

				getDimensions();
				initPaths();
				sizer();

				circleScrubber();
				firstTime = false;
			}

			active = true;
			

			//keeping track of tracking session
			if(mTrackerArray.length > 0){
				if(mTrackerArray[mTrackerArray.length-1].isActive === true){
				mTrackerArray[mTrackerArray.length-1].endPos = getMigrantsVideoCurrentPos();
				mTrackerArray[mTrackerArray.length-1].isActive = false;
				}
				else{
					var mTracker = {};
					mTracker.isActive = true;
					mTracker.startPos = getMigrantsVideoCurrentPos();
					mTracker.endPos = getMigrantsVideoCurrentPos();
					mTracker.isCrossOriginArc = false;
					mTracker.arcSegment = null;
					mTrackerArray.push(mTracker);

				}
				loadArcSegs();
			}
			vennTracking();

		},
		deactivate:function(){
			migrantsContent.fadeOut("fast");
			migrantsVideoJqry.css({opacity: "0.0"});
			pauseVideos();
			active = false;
			if(mTrackerArray.length <= 0){
				console.log("Fading out migrants" + mTrackerArray);
			}
			else{
				if(mTrackerArray[mTrackerArray.length-1].isActive){
				mTrackerArray[mTrackerArray.length-1].endPos = getMigrantsVideoCurrentPos();
				mTrackerArray[mTrackerArray.length-1].isActive = false;
				}
			}
		},
		resize:function(){
			sizer();
			// init();
			refreshArcSegs();
			prevVenID = -1;
			arrayActFills();
		},
		blockMenu: blockMenu
	};

	window.migrants = migrants;

}(this));

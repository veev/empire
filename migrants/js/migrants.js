(function(window) {
	'use-strict';

	// Constants
	var MAX_TIME_OF_DAY = 24 * 60 * 60;
	var MAX_VOLUME = 20;
	var TICK_SPACING = 69;
	var WHITE = '#FFFFFF';
	var BLACK = '#000000';
	var ORANGE = '#ff5a00';
	//initialize scaling constants in initPaths() from page height
	var width;
	var height;
	var radius;
	var center; // horizontal
	var middle; // vertical

	var firstTime = true;
	var active = false;
	var pageLoaded = false;
	var showProgress = false;
	var allVideosLoaded = false;
	var currentVolume = 0;
	var intervalID = 0;
	var amount = 0;
	var insructIvl;
	var prevVenID = -1;
	var timecodeArray = [];
	var actFillArray = [];
	var archtype;
	var timeProgressArc = null;
	var instructionsOff = false;
	var progressCircle;
	var initPathNewPos = 0;
	var vennMap;
	var timeCircle = null;
	var watchedFullMigrants = false;
	var shouldShowVideo = false;
	var mTrackerArray = [];
	var mTimeSegArray = [];
	var downloadMigrants = false;
	var returnMigrants = false;
	var originCrossed = false;
	var previousPos = 0;
	var remoteClock;
	var migrantsVideo;
	var migrantsSource;
	var countryLabels;

	var migrantsContent,
		migrantsTop,
		container,
		holder;

	function map(i, sStart, sEnd, tStart, tEnd) {
		var v = i - sStart;
		if (v >= 0) {
			if (i < sStart) {
				return tStart;
			}
			if (i > sEnd) {
				return tEnd;
			}
		} else if (i < sStart) {
			return tStart;
		} else if (i < sEnd){
			return tEnd;
		}

		var sRange = sEnd - sStart;
		if (!sRange) {
			return tStart;
		}

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
	Load list of viewed segments from localStorage
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

		if(initDur > 0){
			initPos = (initDur / migrantsVideo.duration);
			initPathNewPos = initPos*360;
		}

	}

	function loadArcSegs(){
		//console.log("in LoadArcSegs");
		for (var i = 0; i < mTrackerArray.length; i++) {
			if(mTrackerArray[i].arcSegment === null){
				mTrackerArray[i].arcSegment = archtype.path();
				var transformArc = 'r-90,' + center + ',' + middle;
				mTrackerArray[i].arcSegment.transform(transformArc);
				mTrackerArray[i].arcSegment.attr({'opacity': 1});
				// mTrackerArray[i]
				// .arcSegment
				// .attr({
				// 	'stroke': ORANGE,
				// 	'stroke-width': '1',
				// 	'stroke-opacity': '1'});

				//console.log("added new arc");
			}
		}
	}

	function clearArcSegs() {
		for (var i = 0; i < mTrackerArray.length; i++) {
			mTrackerArray[i].arcSegment.remove();
		}
	}

	function arcseg(cx, cy, radius, startAngle, endAngle) {
		var startX,
			startY,
			endX,
			endY,
			path,
			close = false;

		if (Math.abs(endAngle - startAngle) >= Math.PI * 2 - 0.001) {
			close = true;
			if (startAngle > endAngle) {
				endAngle += 0.001;
			} else {
				endAngle -= 0.001;
			}
		}

		startX = cx + Math.cos(startAngle) * radius;
		startY = cy + Math.sin(startAngle) * radius;
		endX = cx + Math.cos(endAngle) * radius;
		endY = cy + Math.sin(endAngle) * radius;

		path = [
			['M', startX, startY], // starting point
			[
				'A', // draw an arc
				radius, // horizontal radius
				radius, // vertical radius
				endAngle - startAngle, // x-axis-rotation
				endAngle - startAngle > Math.PI ? 1 : 0, // large-arc-flag
				endAngle > startAngle ? 1 : 0, // sweep-flag
				endX, // target x coord
				endY // target y coord
			]
		];

		if (close) {
			path[1].push('Z');
		}

		return {
			path: path
		};
	}

	/*
	Initialize paths
	*/
	function initPaths() {
		width = $("#migrants_top").height();
		height = $("#migrants_top").height();;

		radius = height - 40;
		center = width / 2; // horizontal
		middle = height / 2; // vertical
		
		var totalArc,
			timeArc,

			// define some line styles we'll use a few times
			styles = {
				solid: {
					'fill': WHITE,
					'stroke': WHITE,
					'stroke-width': '1',
					'stroke-opacity': '1'
				},
				timeText: {
					'fill': WHITE,
					'font-family': 'AGaramond-Italic',
					'font-size': '18',
					'stroke-width': '0',
					'stroke-opacity': '0.6',
					'opacity': '0.6'
				},
				timeDot: {
					'fill': WHITE,
					'stroke': WHITE,
					'opacity': '0.6'
				},
				tick: {
					stroke: WHITE,
					'opacity': '0.9',
					'stroke-width': '0.8'
				}
			};

		archtype = Raphael('holder', width, height);
		//archtype.canvas.setAttribute('preserveAspectRatio', 'none');

		//keep svg centered
		archtype.canvas.style.left = '50%';
		archtype.canvas.style.marginLeft = -center + 'px';

		archtype.customAttributes.arcseg = arcseg;

		archtype.customAttributes.arc = function (xloc, yloc, value, total, radius) {
			var start = -Math.PI / 2,
				end = start + value / total * Math.PI * 2;

			return arcseg(xloc, yloc, radius, start, end);
		};

		totalArc = archtype.path();
		totalArc.attr({
			'stroke': WHITE,
			'stroke-width': 1,
			arc: [
				center,
				middle,
				100,
				100,
				middle - 50
			]
		});
		totalArc.node.id = 'total-arc'; //debug

		
		timeArc = archtype.path();
		timeArc.attr({
			'stroke': '#888',
			'stroke-width': 2,
			'fill': 'none',
			'stroke-miterlimit': 10,
			'stroke-dasharray': '.',
			arcseg: [
				center,
				middle,
				middle - 30,
				0,
				Math.PI * 2
			]
		});
		timeArc.node.id = 'time-arc'; //debug
	
		
		timeProgressArc = archtype.path();

		timeCircle = archtype.circle(center, 0, 0)
			.attr(styles.solid)
			.data('id', 'time-circle');
		timeCircle.node.id = 'time-circle'; //debug

		progressCircle = archtype.circle(center, 0, 0)
			.attr({'fill': ORANGE,
					'stroke': ORANGE,
					'stroke-width': '1',
					'stroke-opacity': '1'})
			.data('id', 'progress-circle');
		progressCircle.node.id = 'progress-circle'; //debug

		// Start Line
		archtype.path('M' + center + ' 40 L' + center + ' 60').attr({stroke: WHITE, 'stroke-width': '1', 'stroke-opacity': '0.6'});

		// Hours text
		archtype.text(center, 10, '24h').attr(styles.timeText);
		archtype.text(center + radius / 2 + 10, height / 4 + 2, '6').attr(styles.timeText);
		archtype.text(center, middle - 2, '12').attr(styles.timeText);
		archtype.text(center - radius / 2 - 12, height / 4 + 2 , '18').attr(styles.timeText);
		archtype.text(center, 38, '20m:50s').attr(styles.timeText);

		// dots next to hours text
		archtype.circle(center + radius / 2, middle, 1).attr(styles.timeDot);
		archtype.circle(center, radius + 20, 1).attr(styles.timeDot);
		archtype.circle(center - radius / 2, middle, 1).attr(styles.timeDot);

 		
		//white time marks = amount of screenings per day
		var r1 = radius / 2 - 14,
			r2 = radius / 2 - 4,

			circleSegment,
			arcStart,
			arcEnd,
			angle,
			angleStart,
			angleEnd,
			timeArc,
			i;

		for (i = 1; i <= TICK_SPACING; i++) {
			//so they match current time (make last one at a bit before origin)
			// circleSegment = map(i, 0, TICK_SPACING, 0, 359.6);
			// angle = Raphael.rad(circleSegment - 90);

			// cos = Math.cos(angle);
			// sin = Math.sin(angle);
			
			// archtype.path([
			// 		['M', center + r1 * cos, middle + r1 * sin],
			// 		['L', center + r2 * cos, middle + r2 * sin]
			// 	])
			// 	.attr(styles.tick);

			//adding currentLoopArc
			arcStart = map((i - 1), 0, TICK_SPACING, 0, 359.6);
			arcEnd = map(i, 0, TICK_SPACING, 0, 359.6);
			angleStart = Raphael.rad(arcStart - 90);
			angleEnd = Raphael.rad(arcEnd - 90);
			
			timeArc = archtype.path();
			timeArc.attr({
				'stroke': WHITE,
				'stroke-width': 2,
				'opacity': 0,
				'fill': 'none',
				arcseg: [
						center,
						middle,
						middle - 30,
						angleStart,
						angleEnd
						]	
			});
			var timeSeg = {};
			timeSeg.arcStart = arcStart;
			timeSeg.arcEnd = arcEnd;
			timeSeg.arcseg = timeArc;
			mTimeSegArray.push(timeSeg);
		}
		//console.log(mTimeSegArray);

		arrayActFills();

		//resizeHolder();
	}

	function initScrollSpy(){
		instructions.scrollspy({
			min: instructions.offset().top,
			onEnter: function(element, position) {
				
				if(active) {
					//console.log('entering m_instructions');
					openScreen();

				}
			},
			onLeave: function(element, position) {
				//console.log('leaving m_instructions');
				instructions.fadeOut();
			}
		});
	}


	function init(){
		migrantsVideo = document.getElementById('migrants_video');
		migrantsVideoJqry = $('#migrants_video');
		migrantsContent =$('#migrantsContent');
		migrantsTop = $('#migrants_top');
		instructions = $('#m_instructions');
		container = $('#m_container');
		holder = $('#holder');

		remoteClock = new RemoteClock('http://digital.pov.org:8080/time-server/', function () {
			if (migrantsVideo.duration) {
				migrantsVideo.currentTime = getCurrentTime();
			}
		});

		initScrollSpy();
		addVideoListeners();
		attachEvents();
	}

/*
	Gets called every frame to update arc position and tracker array
*/
	function circleScrubber() {
		var i;

		if(!active){
			return;
		}

		loadTrackerArray();

		var d = new Date();
		var currentTimeOfDay = d.getHours() * 60 * 60 + d.getMinutes() * 60 + d.getSeconds();

		var timeProgress = map(currentTimeOfDay, 0, MAX_TIME_OF_DAY, 0, 100);

		if(timeProgressArc !== null){ //take out this check?
			
			//take this out if we change from ticks
			// timeProgressArc.attr({
			// 	arc: [
			// 		center,
			// 		middle,
			// 		timeProgress,
			// 		100,
			// 		center - 30
			// 	]
			// });
		}

		var circleStartPos = 0;
		var circleFinishPos = 0;
		var totalArcLength = 0;
		var activeArcs = false;
		//console.log(mTrackerArray);
		checkArcLength();
		saveTrackerArray();

		//console.log("mTrackerArray length: "+mTrackerArray.length);

		for (i = 0; i < mTrackerArray.length; i++) {
			if(mTrackerArray[i].arcSegment !== null){

				if(mTrackerArray[i].isActive){
					activeArcs = true;
					mTrackerArray[i].endPos = getMigrantsVideoCurrentPos();

					if (previousPos >359.7 && mTrackerArray[i].endPos < 0.5) {
						if(mTrackerArray[i].isCrossOriginArc === false){
							//console.log(mTrackerArray.length);

							mTrackerArray[i].endPos = 359.9;
							mTrackerArray[i].isActive = false;
							mTrackerArray.push({
								isActive: true,
								startPos: 0.1,
								endPos: 0,
								isCrossOriginArc: true,
								arcSegment: null
							});
							loadArcSegs();
							//StartPos shouldnt start at 0 as it short circuits line 505
							//console.log("New migrants arc started with startPos 0.1");
							//console.log(mTrackerArray);
						}

					} else {
						if (mTrackerArray[i].startPos && mTrackerArray[i].endPos) {
							mTrackerArray[i].arcSegment.attr({
								'stroke': ORANGE,
								'stroke-width': 2,
								'arcseg': [
									center,
									middle,
									middle - 50,
									Raphael.rad(mTrackerArray[i].startPos),
									Raphael.rad(mTrackerArray[i].endPos)
								]
							});
						};
					}
					previousPos = mTrackerArray[i].endPos;
				} else {
					mTrackerArray[i].arcSegment.attr({
						'stroke': ORANGE,
						'stroke-width': 2,
						'arcseg': [
							center,
							middle,
							middle - 50,
							Raphael.rad(mTrackerArray[i].startPos),
							Raphael.rad(mTrackerArray[i].endPos)
						]
					});
				}

			}
		}

		if(!activeArcs){
			var currentPos = getMigrantsVideoCurrentPos();
			for (i = 0; i < mTrackerArray.length; i++) {
				if(currentPos > mTrackerArray[i].startPos && currentPos < mTrackerArray[i].endPos) {
					//console.log('Drawing over another inactive arc');
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
			//console.log('You Can Now Download Migrants');
		}

		var xloc_ = center;
		var yloc_ = middle;
		var R_ = middle - 30;

		var alpha_ = 360 / 100 * timeProgress;
		var a_ = (90 - alpha_) * Math.PI / 180;
		var x_ = xloc_ + R_ * Math.cos(a_);
		var y_ = yloc_ - R_ * Math.sin(a_);

		for(var j = 0; j < mTimeSegArray.length; j++) {
			if(alpha_ > mTimeSegArray[j].arcStart && alpha_ < mTimeSegArray[j].arcEnd) {
				mTimeSegArray[j].arcseg.animate({
					'opacity': 1}, 800);
			} else {
				mTimeSegArray[j].arcseg.animate({
					'opacity': 0}, 800);
			}
		}

		circleFinishPos = getMigrantsVideoCurrentPos();

		if(showProgress) {
			if(timeCircle !== null){
				timeCircle.animate({cx: x_, cy: y_, r: 4}, 100);
			}
		}


		var ration = getMigrantsVideoCurrentPos();

		if(ration > 0){
			var _cx = center;
			var _cy = middle;
			var _r = middle - 50;

			var cur_x = _cx + Math.cos(Raphael.rad(circleFinishPos - 90)) * _r;
			var cur_y = _cy + Math.sin(Raphael.rad(circleFinishPos - 90)) * _r;

			if(showProgress) {
				progressCircle.animate({cx: cur_x, cy: cur_y, r: 6}, 10);
				progressCircle.toFront();
			}

		}
	}
	function openScreen () {
		var d = new Date();
		//console.log('in migrants openscreen ' + d.getSeconds());
		instructionsOff = false;

		if(allVideosLoaded){
			fadeInMigrantsVideo();
		} else {
			shouldShowVideo = true;
		}

		holder.fadeIn(200, function() {
			holder.css({'cursor' : 'pointer', 'pointer-events' : 'none', 'opacity': 1.0, 'z-index': 100});
			
		});
		instructions.fadeIn(500).css({'cursor' : 'pointer'});
		insructIvl = setTimeout(closeScreen, 8000);
	}

	function closeScreen() {
		migrantsVideoJqry.animate({opacity: '1'}, 1000);
		if(instructionsOff){
			return;
		}

		clearInterval(insructIvl);

		migrantsVideo.volume = 0;
		instructions.fadeOut(1000);
		holder.css({'cursor': 'default'}).fadeOut(1000, function() {
			if(intervalID !== 0){
				clearTimeout(intervalID);
			}

			intervalID = setInterval(fadeInMigrantsAudio, 100);
			showProgress = true;
			instructionsOff = true;
			//console.log('Migrants In Holder FadeOut');
		});

	}

	function getMigrantsVideoCurrentPos(){
		var initPos;
		var initDur = getCurrentTime();
		//console.log("DURATION : " + migrantsVideo.duration);
		return (initDur / migrantsVideo.duration) * 360;
	}

	function sizer() {
		console.log("In Migrants Sizer");
		var w = $('#migrants_top').width();
		var h = $('#migrants_top').height();
		var padtop = h * 0.1; // top of the main title
		var matop = padtop * 1.5; // top of the matrix
		var legbottom = 50; //offset of the bottom play button on the open screen
		var buffer = h - legbottom;
		var centering = (w / 2) - 62;
		
		if( h < 780) { // if this a big screen
			padtop = 20;
			matop = h * 0.15;
			legbottom = 20;

			$("#mbottom_structure").css({'top': '-'+(matop * 0.3)+'px'});
		} 

		if(w > 1440) {
			//RESIZING VIDEO
			var newContainerWidth = w - 160;
			var newContainerHeight = newContainerWidth * 0.20625;
			//console.log("newContainerWidth: " + newContainerWidth + ", newContainerHeight "+newContainerHeight);

			$("#m_container").css({
				'width': newContainerWidth+'px', 
				'height': newContainerHeight+'px', 
				'margin-left': '-'+newContainerWidth/2+'px', 
				'margin-top': '-'+newContainerHeight/2+'px'});
			$("#m_outerinner").css({'width': newContainerWidth+'px'});

		} 

		if (w > 1700) {
			$("#minst_2").css({'left': '42%'});
			$("#minst_3").css({'left': '43%'});
		} else {
			$("#minst_2").css({'left': '40%'});
			$("#minst_3").css({'left': '42%'});
		}

		$('#migrants_title').css({ 'padding-top': padtop, 'height' : matop });

		$('#mainarea').css({ 'margin-top': 20 });
		$('.vertical_line').css({ 'height' : h });
		$('#migrants_wline1').css({ 'height': h });
		$('#migrants_wline2').css({ 'height': h });
		$('#migrants_wline3').css({ 'height': h });
		$('#m_legmore').css({ 'margin-left': ($('#migrants_main').width() / 2) - 90 });
		$('#minst_2').css({'top': h * 0.15});
		$('#minst_3').css({'top': h * 0.815});

		if (h < 710) {
			$('#m_a').css({'padding-left': 42, 'top': -8});
			$("#m_a2").css({'padding-left': 505, 'top': 16});
		} else if (h >= 710 && h < 800) {
			$('#m_a').css({'padding-left': 42, 'top': -24});
			$('#m_a2').css({'padding-left': 505, 'top': 10});
		} else {
			$('#m_a').css({'padding-left': 42, 'top': -24});
			$('#m_a2').css({'padding-left': 505, 'top': 10});
		}
		//fix scaling
		var tempHolderWidth = Math.ceil(Math.max(h, w * 0.595));
		holder.css({'width' : tempHolderWidth});

		$('#m_download').css({'left': ($('#m_outerinner').width()*0.465) , 'top' : (h/2) - 44 });
		$('#migrantsmore').css({'top': buffer, 'left': centering });
	}

	function resizeHolder() {
    	resizing = true;
   		clearTimeout(this.id);
    	this.id = setTimeout(function(){
    		var win = $(this);
   			archtype.changeSize(win.height(), win.height(), false, false);
   			resizing = false;
    	}, 500);
	}

	function vennTracking() {
		container.on({
			'mouseenter': function() {
				if(instructionsOff && !downloadMigrants) {
					vennMapOn();
					vennMapIsOn = true;
				}
			},
			'mouseout' : function() {
				if(instructionsOff && !downloadMigrants) {
					vennMapOff();
					vennMapIsOn = false;
				}
			}
		});
	}

	function vennMapOn() {
		if (holder.is(':visible') === false){
		migrantsVideoJqry.animate({
			'z-index': 10
		}, 800);

		holder.fadeIn(800).css({'z-index': 20});
		}

	}

	function vennMapOff() {
		if (holder.is(':visible') === true){
			migrantsVideoJqry.animate({
				'z-index': 20
			}, 800);
			holder.fadeOut(800).css({'z-index': 10});
		}
	}

	function audioToggle() {
		if(active) {
			var showProgress = false;
			//console.log('[ AudioToggle ] Audio Volume is: ' + migrantsVideo.volume);
			if(migrantsVideo.volume > 0){
				migrantsVideo.volume = 0;
			} else {
				migrantsVideo.volume = 0.25;
			}
		}
	}

	function fadeInMigrantsVideo(){
		document.getElementById('migrants_video').volume = 0;
		playButton();
		$('#migrants_video').animate({opacity: '0.5'}, 4000);
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
		//console.log(m_url);
		m_url = 'timecode.json';
		var data = $.parseJSON($.ajax({
			url: m_url,
			dataType: 'json',
			async: false
		}).responseText);
		return data;
	}

	function fadeInMigrantsAudio() {
		// internal function to fade in audio
		//console.log('In fadeInMigrantsAudio');

		if(currentVolume < 0) {
			currentVolume = 0;
		} else if (currentVolume > 100) {
			currentVolume = 100;
		} else {
			currentVolume += 3;
		}
		migrantsVideo.volume = currentVolume / 100;
		
		if(currentVolume > MAX_VOLUME) {
			clearInterval(intervalID);
		}

	}

	function fadeOutMigrantsAudio() {
		// internal function to fade outaudio
		//console.log('In fadeOutMigrantsAudio');
		if(migrantsVideo.playing) {
			if(currentVolume < 0 ) {
				currentVolume = 0;
			} else if (currentVolume > 100) {
				currentVolume = 100;
			} else {
				currentVolume -= 1;
			}

			migrantsVideo.volume = currentVolume / 100;
		
			if(_currentaudiovolume === 0){
				clearInterval(intervalID);
			}
		}
	}

	function videoPlaying() {
		var targetTime = getCurrentTime();
		if (Math.abs(migrantsVideo.currentTime - targetTime) > 0.3) {
			migrantsVideo.currentTime = getCurrentTime();
		}
	}

	function attachEvents() {
		var body = $(document.body);

		$('#cradle_mbutton').on('click', function() {
			body.animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(0);
			});
		});

		$('#legacy_mbutton').on('click', function() {
			body.animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(1);
			});
		});

		$('#periphery_mbutton').on('click', function() {
			body.animate({ scrollTop: (migrantsTop.offset().top) }, 1000, function() {
				animateButton(3);
			});
		});

		$('#migrantsmore').fadeIn(4000).on('click', function() {
			body.animate({scrollTop: ($('#migrants_main').offset().top) }, 1000);
			openScreen();
		});

		instructions.on('click', function() {
			closeScreen();
			//console.log('Migrants on Instruction click');
		})

		/* block video context menu */
		migrantsVideo.addEventListener('contextmenu', function (evt) {
			evt.preventDefault();
		});
	}

	function addVideoListeners() {

			migrantsVideo.addEventListener('canplay', loadVideo, true);
			migrantsVideo.addEventListener('ended', pauseVideos, true);
			migrantsVideo.addEventListener('timeupdate', scrubberUpdater, true);
	}

	function removeVideoListeners() {
			migrantsVideo.removeEventListener('canplay', loadVideo, true);
			migrantsVideo.removeEventListener('ended', pauseVideos, true);
			migrantsVideo.removeEventListener('timeupdate', scrubberUpdater, true);
	}

	function loadVideo() {
		//console.log('[ Migrants : Canplay Event ] Video Loaded');
		allVideosLoaded = true;
		progressArcInitPos();

		if(active && migrantsVideo.paused) {
			var showProgress = false;
			playButton();
			migrantsVideo.volume = 0;
			//console.log("if active and video paused, then play");
		}

		if($('#migrants_video').css('display') === 'none' && shouldShowVideo){
			fadeInMigrantsVideo();
			//console.log("fade in migrants video");
		}
	}

	function emptyVideoSrc() {
		migrantsVideo.src = "";
		migrantsVideo.load();
		//console.log("emptying video source");
	}

	function loadVideoSrc() {
		migrantsSource = document.getElementById('migrants_source');
		migrantsSource.setAttribute('src', 'http://dalcr8izwrdz8.cloudfront.net/migrants/MIGRANTS_1440p_629video_48audio_3gain.mp4');
		migrantsVideo.load();
		//console.log("loading video source");
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
			try{
				migrantsVideo.currentTime = getCurrentTime();	
				// console.log(migrantsVideo.currentTime);
				// console.log(migrantsVideo.duration);
				// console.log(getCurrentTime());
			}
			catch(e){
				// console.log(e);
				// console.log(migrantsVideo.currentTime);
				// console.log(migrantsVideo.duration);
			}
			
			migrantsVideo.play();
			circleScrubber();
		}
	}

	function getCurrentTime(){
		var d,
			currentTimeOfDay,
			currentTimeForVideo;

		if (remoteClock && remoteClock.accuracy() <= 500) {
			// console.log("RemoteClock time");
			// console.log(remoteClock.time());
			d = new Date(remoteClock.time());
		} else {
		//console.log("default time");	
			d = new Date();
		}
		// console.log("Current time");
		// console.log(d);
		currentTimeOfDay = d.getHours() * 60 * 60 + (d.getMinutes()) * 60 + d.getSeconds();
		currentTimeForVideo = currentTimeOfDay % migrantsVideo.duration;
		return currentTimeForVideo;
	}

	function pauseVideos(){
		if(!migrantsVideo.paused) {
			fadeOutMigrantsAudio();
			migrantsVideo.pause();
		}
	}

	function downloadScreen() {
		var props = {
			opacity: '1.0',
			fill: ORANGE
		};

		$('#m_endscreen').fadeIn();
		for(var j=0; j<actFillArray.length; j++){
			actFillArray[j].actFill.animate(props, 800);
		}

		countryLabels.ghana.attr({fill: BLACK, opacity: '0'});
		countryLabels.brazil.attr({fill: BLACK, opacity: '0'});
		countryLabels.suriname.attr({fill: BLACK, opacity: '0'});
		vennMapOn();
	}

	function resetMigrants() {
		var props = {
			opacity: '0',
			fill: ORANGE
		};

		$('#m_endscreen').fadeOut();
		for(var j=0; j<actFillArray.length; j++){
			actFillArray[j].actFill.animate(props, 800);
		}

		countryLabels.ghana.attr({fill: BLACK, opacity: '1'});
		countryLabels.brazil.attr({fill: BLACK, opacity: '1'});
		countryLabels.suriname.attr({fill: BLACK, opacity: '1'});
		vennMapOff();

		clearArcSegs();
		
		//mTrackerArray = [];
		while(mTrackerArray.length > 0) {
			mTrackerArray.pop();
		}

		localStorage.clear();

		//console.log("Reset Migrants");
	}

	//Called every frame
	function scrubberUpdater() {
		var currentTime = migrantsVideo.currentTime;
		var timeCode,
			actFill,
			i, j;

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

		if(instructionsOff) {
			/*
			Highlight appropriate Venn section based on current time in video
			*/
			for (i = 0; i < timecodeArray.length; i++) {
				timeCode = timecodeArray[i];

				if(currentTime < timeCode.Maxtime){

					if(timeCode.Venn !== prevVenID){

						for(j = 0; j < actFillArray.length; j++){

							actFill = actFillArray[j];
							if(actFill.vennId === timeCode.Venn){
								//console.log("act Fill venn ID: " + actFill.vennId);

								//Turn on act Fill
								actFill.actFill.animate({opacity: '1.0'}, 800);

								if(actFill.vennId === 7) {
									actFill.actFill.animate({opacity: '0.0'}, 400);
								}

								countryLabels.ghana.attr({'opacity': '1'});
								countryLabels.brazil.attr({'opacity': '1'});
								countryLabels.suriname.attr({'opacity': '1'});

								//Ghana Label
								if(actFill.vennId === 0) {
									countryLabels.ghana.attr({fill: BLACK});
								} else if (actFill.vennId === 1 || actFill.vennId === 5 || actFill.vennId === 6) {
									countryLabels.ghana.attr({fill: ORANGE});
								} else {
									countryLabels.ghana.attr({fill: WHITE});
								}

								//Brazil Label
								if(actFill.vennId === 4) {
									countryLabels.brazil.attr({fill: BLACK});
								} else if (actFill.vennId === 3 || actFill.vennId === 5 || actFill.vennId === 6) {
									countryLabels.brazil.attr({fill: ORANGE});
								} else {
									countryLabels.brazil.attr({fill: WHITE});
								}

								//Suriname Label
								if (actFill.vennId === 2) {
									countryLabels.suriname.attr({fill: BLACK});
								} else if (actFill.vennId === 1 || actFill.vennId === 3 || actFill.vennId === 6) {
									countryLabels.suriname.attr({fill: ORANGE});
								} else {
									countryLabels.suriname.attr({fill: WHITE});
								}
							}else {
								actFill.actFill.animate({opacity: '0.0'}, 400);
							}
						}
						prevVenID = timeCode.Venn;
					}
					break;
				}
			}
		}

		if(downloadMigrants) {
			downloadScreen();
			instructionsOff = false;
			//returnMigrants = true;
		}

		if (returnMigrants) {
			returnMigrants = false;
			instructionsOff = true;
			prevVenID = -1;
			resetMigrants();
		}
	}

	function arrayActFills() {
		var styles = {
				vennSection: {
					//opacity: '0.8', duplicate
					'fill': ORANGE,
					'stroke': '#231F20',
					'stroke-miterlimit': '10',
					'stroke-width': '0',
					'stroke-opacity': '1',
					'opacity': '0'
				},
				countryText: {
					'fill': WHITE,
					'font-family': 'AGaramond',
					'font-size': '12',
					'stroke-width': '0',
					'stroke-opacity': '1',
					'opacity': '0'
				},
				countryCircle: {
					'fill': 'none',
					'stroke': WHITE,
					'stroke-width': '1.35',
					'stroke-miterlimit': '1',
					'stroke-dasharray': '.',
					'parent': 'vennMap',
					'stroke-opacity': '1'
				}
			},
			fills = [
				// Ghana
				'M151.016,14.703C107.713-8.178,47.436-0.706,16.925,51.2c-30.768,52.341-5.337,112.775,35.211,136.491c0,0-4.502-54.25,48.776-85.542l0,0C102.103,39.941,151.016,14.703,151.016,14.703z',

				// Ghana/Suriname
				'M54.049,188.727c0,0-2.962-54.283,46.964-84.548c0,0-1.597,54.445,49.528,84.737C150.542,188.916,107.244,217.944,54.049,188.727z',

				// Suriname
				'M54.016,190.624c2.112,48.932,38.661,96.314,98.65,97.459c60.5,1.154,100.263-50.859,100.263-97.834c0,0-46.332,29.789-100.241-0.4l0,0C98.39,220.228,54.016,190.624,54.016,190.624z',

				// Suriname/Brazil
				'M252.929,188.042c0,0-46.623,28.983-97.796,0.877c0,0,48.898-27.42,48.553-86.418C203.686,102.5,251.637,127.364,252.929,188.042z',

				// Brazil
				'M154.553,14.703C197.858-8.178,258.134-0.706,288.645,51.2c30.768,52.341,6.904,111.189-33.646,134.904c0,0,2.31-54.126-50.968-85.417l0.04,0.289C202.881,38.768,154.553,14.703,154.553,14.703z',

				// Brazil/Ghana
				'M152.602,15.72c0,0,48.271,25.799,49.519,84.169c0,0-48.351-29.993-98.954,0.922C103.167,100.812,100.701,47.178,152.602,15.72z',

				// Center
				'M102.974,103.196c53.163-30.742,99.005-1.572,99.005-1.572c-2.126,62.971-49.312,86.066-49.312,86.066C102.952,158.226,102.974,103.196,102.974,103.196z',

				// ghan_braz_suri_off
				'M102.974, 103.196'
			];

		vennMap = archtype.set();
		vennMap.attr({'name': 'vennMap'});

		// Circles
		var circle_u = archtype.circle(102.349, 101.852, 100.51).attr(styles.countryCircle).data('id', 'circle_u');
		var circle_v = archtype.circle(202.858, 101.852, 100.51).attr(styles.countryCircle).data('id', 'circle_v');
		var circle_w = archtype.circle(153.553, 188.729, 100.51).attr(styles.countryCircle).data('id', 'circle_w');

		vennMap.push(circle_u, circle_v, circle_w);

		// Orange fill segments
		fills.forEach(function (pathSrc, id) {
			var path, fill;
			//console.log("venn id: " + id);

			path = archtype.path(pathSrc);
			path.attr(styles.vennSection);
			path.data('id', id);
			vennMap.push(path);

			actFillArray.push({
				actFill: path,
				vennId: id
			});
		});

		// Country labels
		countryLabels = {
			ghana: archtype.text(60, 25, 'Ghana').attr(styles.countryText),
			brazil: archtype.text(240, 25, 'Brazil').attr(styles.countryText),
			suriname: archtype.text(150, 130, 'Suriname').attr(styles.countryText)
		};

		vennMap.push(countryLabels.ghana, countryLabels.brazil, countryLabels.suriname);

		var mapCenter;
		var mapScalar = map(height, 560, 1200, 1, 2.0); //how much to scale up venn diagram circles
		//console.log("Migrants mapScalar = "+mapScalar);

		var bbox = vennMap.getBBox(),
			bboxW = Math.ceil(bbox.width),
			bboxH = Math.ceil(bbox.height);

		//console.log("VennMap bbox: "+ bboxW+ ', '+bboxH);
		centerW = (bboxH/2) * 0.95;
		centerH = (bboxH/2);
		//console.log("Migrants holder center: " + centerW + ' height: '+centerH);
		//scale at origin and then translate by half of bounding box size
		vennMap.transform('s' + mapScalar + ','+ mapScalar +', 0, 0 t ' + centerW + ' ' + centerH);
	}

	function pageHidden() {
		pauseVideos();

		if(mTrackerArray.length <= 0){
				//console.log('Fading out migrants' + mTrackerArray);
			} else if(mTrackerArray[mTrackerArray.length - 1].isActive){
				mTrackerArray[mTrackerArray.length - 1].endPos = getMigrantsVideoCurrentPos();
				mTrackerArray[mTrackerArray.length - 1].isActive = false;
			}
	}

	function pageVisible() {
		playVideos();
		active = true;
		var currentPos = getMigrantsVideoCurrentPos();
		//console.log(currentPos);
		//keeping track of tracking session
		if(mTrackerArray.length > 0) {
			if(mTrackerArray[mTrackerArray.length-1].isActive === true){
			mTrackerArray[mTrackerArray.length-1].endPos = currentPos;
			mTrackerArray[mTrackerArray.length-1].isActive = false;
			} else {
				var mTracker = {};
				mTracker.isActive = true;
				mTracker.startPos = currentPos;
				mTracker.endPos = currentPos;
				mTracker.isCrossOriginArc = false;
				mTracker.arcSegment = null;
				mTrackerArray.push(mTracker);

			}
		}
	}

	function checkArcLength(){
		var fullRange = [];

		
		if(mTrackerArray.length <=0 ){
			//console.log("mTrackerArray is empty");
			return 0;
		}
		//treating the movie like it consists of 360 steps.
		for (var i = 0; i < mTrackerArray.length; i++) {
			// if(mTrackerArray[i].startPos === mTrackerArray[i].endPos) {continue};
			//find the range that has been watched in arc [i] and add it to the full range
			//i.e is startPos is 10 and endPos is 20
			// curRange [10,11,12,13,14,15,16,17,18,19,20]
		
		try {
			var curRange = _.range(Math.ceil(mTrackerArray[i].startPos), Math.ceil(mTrackerArray[i].endPos), 1);
		}
		catch(e){
			// console.log(e);
			// console.log(mTrackerArray[i]);
			var curRange = 0;
		}
	

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

		return totalAmtWatched >= 64620;
	}

	var migrants = {
		init: init,
		sizer: sizer,
		pauseVideos: pauseVideos,
		playVideos: playVideos,
		pageHidden: pageHidden,
		pageVisible: pageVisible,
		active: function(){
			return active;
		},
		activate: function(){
			migrantsContent.fadeIn(2000);
			pageLoaded = true;
			if(firstTime){
				migrantsContent.css({ 'width' : '100%', 'height' : '100%' });
				$('.migrants_top').css({ 'background' : 'none'});

				//add Migrants JSON file
				var data = jsonCall();
				timecodeArray = loadTimecodeData(data);
				
				sizer();
				initPaths();
				
				migrantsVideo.load();
				circleScrubber();
				firstTime = false;
			} else {
				//loadVideoSrc();
			}

			active = true;
			//addVideoListeners();


			//keeping track of tracking session
			if(mTrackerArray.length > 0) {
				if(mTrackerArray[mTrackerArray.length-1].isActive === true){
				mTrackerArray[mTrackerArray.length-1].endPos = getMigrantsVideoCurrentPos();
				mTrackerArray[mTrackerArray.length-1].isActive = false;
				} else {
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
		deactivate: function(){
			migrantsContent.fadeOut('fast');
			migrantsVideoJqry.css({opacity: '0.0'});
			pauseVideos();
			//emptyVideoSrc();
			//removeVideoListeners();
		
			
			if(downloadMigrants) {
				resetMigrants();
				downloadMigrants = false;
			}
			active = false;
			if(mTrackerArray.length <= 0){
				//console.log('Fading out migrants' + mTrackerArray);
			} else if(mTrackerArray[mTrackerArray.length - 1].isActive){
				mTrackerArray[mTrackerArray.length - 1].endPos = getMigrantsVideoCurrentPos();
				mTrackerArray[mTrackerArray.length - 1].isActive = false;
			}
		},

		resize: function(){
			sizer();
			//arrayActFills();
			//resizeHolder();
			prevVenID = -1;
		}
	};

	window.migrants = migrants;

}(this));

(function (window) {
	'use strict';

	var legacyLoaded = false;
	var legacyActive = false;
	var _adjuster = 140;
	var openTimeIvl;
	var allVideosLoaded = false;
	var l_videoTrackCurrentPosition;

	var active = false;
	var introDismissed = false;
	var firstTime = true;

	var videos = {
		indonesia: null,
		india: null,
		srilanka: null,
		southafrica: null,
		corners: null,
	};

	/*
	important elements that we may need to refer to again
	*/
	var zContainer,
		legacyContent;

	function sizer() {
		var h, w;

		if (!active) {
			return;
		}

		h = $("#legacy_top").height();
		w = $("#legacy_top").width();
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

		w = ($("#legacy_main").width() - _adjuster);
		h = ($("#legacy_main").width() - _adjuster) * 0.31;
		var vtop = (($("#legacy_main").height() - h) / 2) - 50;

		// $("#legplay").css({ "bottom": legbottom, "margin-left": ($("#legacy_main").width() / 2) - 50 }).fadeIn(4000);
		$("#legmore").css({ "margin-left": ($("#legacy_main").width() / 2) - 90 });

		$("#legacymore").css({ "top" : buffer, "left": centering }).fadeIn(4000).on('click', function() {
			body.animate({scrollTop: ($('#legacy_main').offset().top) }, 1000);
			// console.log("openScreen() in legacymore");
			console.log("[Legacy: legacymore listener] if not legacyLoaded, legacy openscreen");
			openScreen();
		});
	}

	function playVideos() {
		var id;

		if (!allVideosLoaded) {
			for (id in videos) {
				if (videos.hasOwnProperty(id)) {
					if (!videos[id] || videos[id].readyState < 2) {
						return;
					}
				}
			}
			allVideosLoaded = true;
		}

		if (active && introDismissed) {
			for (id in videos) {
				if (videos.hasOwnProperty(id) && videos[id]) {
					videos[id].play();
				}
			}
		}
	}

	function selectVideo(selectedId) {
		// $(".zoomTarget").zoomTarget();
		// $(".zoomContainer").zoomContainer();
		var video, id, container;
		for (id in videos) {
			if (videos.hasOwnProperty(id)) {
				video = videos[id];
				if (video) {
					video.volume = (!selectedId || selectedId === id) ? 1 : 0;
				}
			}
		}
		
		container = $('#legacy_container_' + selectedId);
		console.log(container);
		//console.log(zContainer);
		container.zoomTo({targetsize:0.9, duration:600, root: zContainer, closeclick: true });
		// container.zoomTarget();	
	}

	function attachLegacyEvents() {
		/*
		Main page navigation buttons for getting out of Legacy
		*/
		$("#cradle_lbutton").on('click', function() {
			$('html body').animate({ scrollTop: ($('#legacy_top').offset().top) }, 1000, function() {
				animateButton(0);
			});
		});

		$("#migrants_lbutton").on('click', function() {
			$('html body').animate({ scrollTop: ($('#legacy_top').offset().top) }, 1000, function() {
				animateButton(2);
			});
		});

		$("#periphery_lbutton").on('click', function() {
			$('html body').animate({ scrollTop: ($('#legacy_top').offset().top) }, 1000,function(){
			 	animateButton(3);
			});
		});

		/*
		Legacy buttons/controls, Tier #2

		$("#corner1").click(function(evt){
			console.log("in corner1");
			$("#legacy_container_india").zoomTo({targetsize:0.9, duration:600, root: zContainer});
			// indiaVolumeUp();
			evt.stopPropagation();
		});

		$("#corner2").click(function(evt){
			console.log("in corner2");
			$("#legacy_container_southafrica").zoomTo({targetsize:0.9, duration:600, root: zContainer});
			// southafricaVolumeUp();
			evt.stopPropagation();
		});

		$("#corner3").click(function(evt){
			console.log("in corner3");
			$("#legacy_container_srilanka").zoomTo({targetsize:0.9, duration:600, root: zContainer});
			// srilankaVolumeUp();
			evt.stopPropagation();
		});
		$("#corner4").click(function(evt){
			console.log("in corner4");
			$("#legacy_container_indonesia").zoomTo({targetsize:0.9, duration:600, root: zContainer});
			// indonesiaVolumeUp();
			evt.stopPropagation();
		});
		*/

		var cornerOrder = {
			india: 1,
			southafrica: 2,
			srilanka: 3,
			indonesia: 4
		};

		zContainer.click(function(evt){
			console.log("in zoom container");
			selectVideo(null);
			zContainer.zoomTo({ targetsize:0.5, duration:600, root: zContainer });
			evt.stopPropagation();
		});


		Object.keys(videos).forEach(function (id) {
			function selectMe(evt){
				selectVideo(id);
				evt.stopPropagation();
			}

			var corner = '#corner' + cornerOrder[id];
			$(corner).click(selectMe);
			$('#legacy_container_' + id).click(selectMe);
		});
	}

	function initVideos() {
		Object.keys(videos).forEach(function (id) {
			var video = document.getElementById(id + '_leg');
			video.addEventListener('canplay', function () {
				console.log('[ Legacy : Canplay Event ] ' + id + ' Video');
				// playVideos();
			});
			video.load();
			videos[id] = video;
		});
	}

	function init() {
		legacyContent = $("#legacyContent");
		zContainer = $("#z_container");

		// initVideos();
		attachLegacyEvents();
	}

	function openScreen() {
		$("#l_instructions").fadeIn(2000);
		$("#l_instructions").on('click', closeScreen);
	}

	function closeScreen() {
		$("#l_instructions").fadeOut(1000, function() {
			introDismissed = true;
			playVideos();
			if(audioactive) {
				audiostop();
			}
		});
	}

	var legacy = {
		sizer: sizer,
		init: init,
		active: function () {
			return active;
		},
		activate: function () {
			if (firstTime) {
				legacyContent.css({ 'width' : '100%', 'height' : '100%' });
				$(".legacy_top").css({ 'background' : 'none' });
				initVideos();
			}
			firstTime = false;
			if (!active) {
				legacyContent.fadeIn(2000);
			}
			active = true;
			// initVideos();
			// playVideos();
			sizer();

			//load zoomooz.js dynamically
			var s = document.createElement("script");
    		s.type = "text/javascript";
   			s.src = "../../js/jquery.zoomooz.min.js";
    		// Use any selector
    		$("head").append(s);
		},
		deactivate: function () {
			var id;

			//pause all videos
			for (id in videos) {
				if (videos.hasOwnProperty(id) && videos[id]) {
					videos[id].pause();
				}
			}

			if (active) {
				legacyContent.fadeOut("fast");
			}

			active = false;

			//take out zoomooz dynamically
		}
	};

	window.legacy = legacy;
}(this));
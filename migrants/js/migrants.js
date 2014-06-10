var migrantsLoaded = false;
var migrantsActive = false;
var migrantsshowprogress = false;
var m_vidLoaded = false;
var m_videoTrackCurrentPosition = 0;
var m_curtime = 0;
var m_maxVolume = 20;
var m_currentVolume = 0;
var m_intervalID = 0;
var amount = 0;
var insructIvl = new Number();
// var m_enoughwithinstructions = false;
var prevVenID = 7;
var timecodeArray = new Array();
var testTimecode =  new Array();
var actFillArray = new Array();
var rsr;
var rsr_instructions;
var maxTimeOfDay = 24*60*60;
var width;
var height;
var radius;
var archtype;
var total_arc;
var progress_arc;
var time_arc;
var time_progress_arc = null;
var test_arcseg;
var instructionsOff = false;
var progrssCircle; //= rsr.circle(0, 0, 0).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_a','stroke-opacity': '1'}).data('id', 'circle_u'); 
var initPathPos = 0;
var initPathNewPos = 0;
var vennMap;
var timeCircle = null;
var watchedFullMigrants = false;

var mTrackerArray = new Array();
//var ratio;

function progressArcInitPos(){
	var initPos;
	var initDur = m_getCurrentTime();
	// var initDur = document.getElementById("migrants_video").duration -20;
	height = $("#migrants_top").height();
	if(initDur > 0){
		initPos = ( initDur / document.getElementById("migrants_video").duration);
		initPathNewPos = initPos*360;
		initPos *= 100;

		initPathPos = initPos;

		console.log(initPos);
	}

}
function loadArcSegs(){
	for (var i = 0; i < mTrackerArray.length; i++) {
		if(mTrackerArray[i].arcSegment == null){
			mTrackerArray[i].arcSegment = archtype.path();
			var transformArc = "r-90,"+(width/2)+","+(height/2);
			mTrackerArray[i].arcSegment.transform(transformArc);
			console.log("New Arc segment added");
			console.log( mTrackerArray[i]);
		}
	}
}

function m_init(){
	height = $("#migrants_top").height();
	// 0.556 is ratio for holderWidth/ScreenWidth
	console.log("Migrants Init()");

	var holderWidth = $("#migrants_top").width() * 0.595;
	if (holderWidth < height) {
		holderWidth = height;
	}
	radius = height - 40;
	archtype = Raphael("holder", holderWidth, height);
	width = $("#holder").width();
	
	total_arc = archtype.path();
	progress_arc = archtype.path();
	time_arc = archtype.path();
	time_progress_arc = archtype.path();
	test_arcseg = archtype.path();
	

	timeCircle = archtype.circle(0,0,0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u');
	
	var startLine = archtype.path("M400 40 L400 60").attr({stroke: '#fff', "stroke-width": '1','stroke-opacity': '0.6'});
	var twentyfour = archtype.text(400, 10, '24h');
		twentyfour.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'}); 
	var durationTime = archtype.text(400, 38, '22m:06s');
		durationTime.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'}); 
	var sixDot = archtype.circle(width/2 + radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});
	var twelveDot = archtype.circle(400, radius + 20, 1).attr({fill: '#FFFFFF', stroke: '#fff','opacity': '0.6'});
	var eighteenDot = archtype.circle(width/2 - radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});

	archtype.customAttributes.arcseg = function( cx, cy, radius, start_r, finish_r ) {
    var start_x = cx + Math.cos( start_r ) * radius,
        start_y = cy + Math.sin( start_r ) * radius,
        finish_x = cx + Math.cos( finish_r ) * radius,
        finish_y = cy + Math.sin( finish_r ) * radius,
        path;

        // path =
        // [
        //     [ "M", start_x, start_y ],
        //     [ "A", radius, radius, finish_r - start_r,
        //             finish_r - start_r > Raphael.rad( 180 ) ? 1 : 0,    /* large-arc-flag */
        //             finish_r > start_r ? 1 : 0,         /* sweep-flag */
        //             finish_x, finish_y ],               /* target coordinates */
        // ];
        path =
        [
            [ "M", start_x, start_y ],
            [ "A", radius, radius, finish_r - start_r,
                    finish_r - start_r > Raphael.rad( 180 ) ? 1 : 0,    /* large-arc-flag */
                     1 ,         /* SM Hack. sweep-flag is always set to 1. */
                    finish_x, finish_y ],               /* target coordinates */
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
		"stroke-width": 2,
		"stroke-miterlimit": 10,
		"stroke-dasharray": '.',
		//arc: [width/2, height/2, 100, 100, height/2-30 ]
		arcseg: [width/2, height/2,  height/2-30,Raphael.rad(0), Raphael.rad(359) ]
	});

	//DO MATH HERE 
	var spacing = 70;
	for (var i=0; i < spacing; i++) {
			var xloc_ = width/2;
			var yloc_ = height/2;
			// var R_ = radius;	
			var circleSegment = map(i, 0, spacing, 0, 360);

			var _cx = width/2;
			var _cy =  height/2;
			var _r =  height/2 - 30;

			var cur_x = _cx + Math.cos( Raphael.rad( circleSegment - 90  ))  * _r;
			var cur_y = _cy + Math.sin( Raphael.rad( circleSegment - 90  ))  * _r;			

			var testSeg= archtype.circle(cur_x , cur_y, 2.5).attr({fill: '#ff5a00', stroke: 'none', 'opacity': '0.9'});
	};
	



// 	progrssCircle.animate({cx:cur_x,cy:cur_y,r:6}, 10);
	time_progress_arc.attr({
    	"stroke": "#fff",
    	"stroke-width": 2,
    	'fill': 'none',
		"stroke-width": 2,
		"stroke-miterlimit": 10,
		"stroke-dasharray": '.',
    	arc: [width/2, height/2, timeProgress, 100, height/2 -30]
	});

	m_arrayActFills();

	progrssCircle = archtype.circle(0, 0, 0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u'); 

}

function m_circleScrubber() {

	if(! migrantsActive){
		return;
	}
	var d = new Date();
	var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();
	var maxTimeOfDay = 24*60*60;

	var timeProgress = map(currentTimeOfDay, 0, maxTimeOfDay, 0, 100);

	if(document.getElementById("migrants_video").currentTime >= document.getElementById("migrants_video").duration ){
		initPathNewPos = 0;
		initPathPos = 0;

		//is this where we call the transform again?
		// loadArcSegs();
		mTracker.isActive = true;
		mTracker.startPos = getMigrantsVideoCurrentPos();
		mTracker.endPos = getMigrantsVideoCurrentPos();
		mTracker.arcSegment = null;
		
		var transformArc = "r-90,"+(width/2)+","+(height/2);
		mTracker.arcSegment.transform(transformArc);

		mTrackerArray.push(mTracker);

	}
	
	if(time_progress_arc !== null){
		// console.log(time_progress_arc);
		time_progress_arc.attr({
			"stroke": "#fff",
			"stroke-width": 2,
			arc: [width/2, height/2, timeProgress, 100, height/2 - 30]
		});
	}
	
	var circleStartPos = 0;
	var circleFinishPos = 0;
	// var circleStartPosY = 0;
	var totalArcLength = 0;
	for (var i = 0; i < mTrackerArray.length; i++) {
		if(mTrackerArray[i].arcSegment !== null){
			if(mTrackerArray[i].isActive){
				// console.log(mTrackerArray[i].startPos);
				// console.log(getMigrantsVideoCurrentPos());
				 mTrackerArray[i].arcSegment.attr({
					"stroke": "#ff5a00",
					"stroke-width": 2,
					arcseg: [ width/2, height/2, height/2 - 50, Raphael.rad( mTrackerArray[i].startPos ), Raphael.rad( getMigrantsVideoCurrentPos()) ] 
				})
				 totalArcLength += Math.abs(getMigrantsVideoCurrentPos()- mTrackerArray[i].startPos);
				 circleStartPos = mTrackerArray[i].startPos;
				 circleFinishPos  = getMigrantsVideoCurrentPos();
			}
			else{
				mTrackerArray[i].arcSegment.attr({
					"stroke": "#ff5a00",
					"stroke-width": 2,
					arcseg: [ width/2, height/2, height/2 - 50, Raphael.rad( mTrackerArray[i].startPos ), Raphael.rad( mTrackerArray[i].endPos) ] 
					
				});				

				totalArcLength += Math.abs( mTrackerArray[i].endPos - mTrackerArray[i].startPos);
			}

		}
	}

	if(totalArcLength >80 && totalArcLength < 90 ){
		console.log("total arc length : "+ totalArcLength);	
	}

	if(totalArcLength >170 && totalArcLength < 190 ){
		console.log("total arc length : "+ totalArcLength);	
	}

	if(totalArcLength >260 && totalArcLength < 280 ){
		console.log("total arc length : "+ totalArcLength);	
	}

	if(totalArcLength >350 && totalArcLength < 370 ){
		console.log("total arc length : "+ totalArcLength);	
	}
	
	var xloc_ = width/2;
	var yloc_ = height/2;
	var R_ = height/2 - 30;

	var alpha_ = 360 / 100 * timeProgress;
	var a_ = (90 - alpha_) * Math.PI / 180;
	var x_ = xloc_ + R_ * Math.cos(a_);
	var y_ = yloc_ - R_ * Math.sin(a_);		

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

		progrssCircle.animate({cx:cur_x,cy:cur_y,r:6}, 10);
		progrssCircle.toFront();
	}
}

function getMigrantsVideoCurrentPos(){
	var initPos;
	var initDur = m_getCurrentTime();
	height = $("#migrants_top").height();

	ration = ( initDur / document.getElementById("migrants_video").duration);
	ration *= 360;
	return ration;
} 

function migrants_sizer() {
	var w = $("#migrants_top").width();
	var h = $("#migrants_top").height();
	//console.log("w: "+w+ ", h: " + h);
	var padtop = h * 0.11; // top of the main title
	var matop = padtop + 70; // top of the matrix

	var legbottom = 70; //offset of the bottom play button on the open screen
	var buffer = h - legbottom;
	//console.log("buffer = "+ buffer);
	var centering = (w/2) - 62;
	//console.log("centering = "+ centering);
	var body = $('html body');
	if($(".migrants_top:first").height() < 780){ // if this a wee screen
		padtop = 20;
		matop = 140;
		legbottom = 20;
	}
	
	$("#migrants_title").css({ 'padding-top': padtop, 'height' : matop });

	$("#mainarea").css({ "margin-top": 20 });
	
	// var vtop = (($("#legacy_main").height() - h) / 2) - 50;
	
	$(".vertical_line").css({ 'height' : h });
	$("#migrants_wline1").css({ 'height': h });
	$("#migrants_wline2").css({ 'height': h });
	$("#migrants_wline3").css({ 'height': h });

	$("#m_legmore").css({ "margin-left": ($("#migrants_main").width() / 2) - 90 });

	if (h < 700) {
		$("#minst_2").css({"top": '14%'});
		$("#minst_3").css({"top": '70%'});
	} else {
		$("#minst_2").css({"top": '13%'});
		$("#minst_3").css({ "top": '80%'});
	}

	$("#migrantsmore").css({"top": buffer, "left": centering }).fadeIn(4000).on('click', function() {
		body.animate({scrollTop: ($('#migrants_main').offset().top) }, 1000);
		 console.log("migrants_openinstructions() in migrantsmore");
		 // $("#migrants_video").fadeIn(4000);
		 // $("#holder").fadeIn(4000);
		 //m_instructionFills();
		 // m_playVids();
		 // m_arrayActFills();
		 migrants_openinstructions();
		 console.log("[ more button click: migrants_openinstructions ] instructionsOff ? " + instructionsOff );
		if(!migrantsLoaded) {
			console.log("[Migrants: migrantsmore listener] if not migrantsLoaded, migrants openscreen");
			//migrants_openinstructions();
		}
	});

	console.log("migrants_sizer");
}

function m_vennTracking() {

	var timer;

	$("#m_container").on({
	    'mousemove': function () {
	    	if(instructionsOff) {
				m_vennMapOn();
			} 
			else {
					console.log("[mouseleave] migrants instructionsOff is false");
			}
			clearTimeout(timer);
	        timer = setTimeout(function () {
				if(instructionsOff) {
					m_vennMapOff();
				} else {
					console.log("[mouseenter] migrants instructionsOff is false");
				}
	        }, 5000);
	    },
	    'mouseout' : function () {
	    	if(instructionsOff) {
				m_vennMapOff();
			} else {
				console.log("[mouseenter] migrants instructionsOff is false");
			}
	        clearTimeout(timer);
	    }
	});

	$("#m_instructions").on('click', function () { 
		//console.log("[ Periphery : periphery_openscreen ] + Calling playbutton in instructions event handler")
		migrants_closeinstructions(); 
		console.log("[ m_instructions click: migrants_closeinstructions ] instructionsOff ? " + instructionsOff );
		//console.log("[Periphery: openscreen] periphery_closescreen on instructions click");
	});

	$("#holder").on('click', function () { 
		//console.log("[ Periphery : periphery_openscreen ] + Calling playbutton in instructions event handler")
		// migrants_closeinstructions(); 
		console.log("[ holder click: migrants_closeinstructions ] instructionsOff ? " + instructionsOff );
		//console.log("[Periphery: openscreen] periphery_closescreen on instructions click");
	});
}

var m_vennMapOn = function() {

	$("#migrants_video").animate({
		// opacity: 0.5,
		'z-index': 10
	}, 800);

	$("#holder").fadeIn(800).css({'z-index': 20});

	// $("#holder").css("z-index","20");
};

var m_vennMapOff = function() {
	$("#migrants_video").animate({
		// opacity: 1.0,
		'z-index': 20
	}, 800);
	$("#holder").fadeOut(800).css({'z-index': 10});
	// $("#holder").animate({
	// 	opacity: 0.0,
	// 	'z-index': 10
	// }, 800);
	// $("#migrants_video").css("z-index" , "20");
	// $("#holder").css("z-index","10");
};

function m_audioToggle() {
	if(migrantsActive) {
		 console.log("[ AudioToggle ] Audio Volume is: "+ document.getElementById("migrants_video").volume);
		if(document.getElementById("migrants_video").volume > 0){
			document.getElementById("migrants_video").volume = 0; 
		}
		else{
			document.getElementById("migrants_video").volume = 1;
		}
	} else {
		console.log("[ Migrants: m_audioToggle ] migrantsActive ? : " + migrantsActive);

	}
}

function loadTimecodeData(data){
	var localArray = new Array();
	for (var i = 0; i < data.length; i++) {
      // var tCodeArray = JSON.parse(data[0]);
      // console.log( data[0].Timecode);
      for(var j =0; j<data[0].Timecode.length; j++){
      	// console.log( data[0].Timecode[j]);
      	localArray.push(data[0].Timecode[j]);
      }

    }
	
	for (var i = 0; i < localArray.length; i++) {
		//console.log(localArray[i].Venn);
	}
	return localArray;

}

function m_jsonCall() {
	console.log(m_url);
	m_url = "/timecode.json"
	var data = $.parseJSON($.ajax({
        url:  m_url,
        dataType: "json", 
        async: false
    }).responseText);
    
    //console.log(data);
    return data;
}

function migrants_openinstructions () {
	// console.log("in migrants openscreen");
	instructionsOff = false;
	// m_playVids();

	$("#migrants_video").fadeIn(4000, function() {
		console.log("[migrants_openinstructions] migrants_video fadeIn");
	});
	
	$("#holder").fadeIn(4000, function() {
		$("#holder").css({'pointer-events' : 'none', 'opacity': 1.0, 'z-index': 100});
	});
	// $("#rsr_instructions").css({"z-index":100}).fadeIn(2000);
	$("#m_instructions").fadeIn(4000);	 
	console.log("[Migrants: openscreen ] migrants_closeinstructions on setTimeout 1");
	insructIvl = setTimeout(migrants_closeinstructions,5000);
}

var migrants_closeinstructions = function () {
	m_playButton();
	if(instructionsOff){
		console.log("Instructions already off")
		return;
	}

	clearInterval(insructIvl);

	if (audioactive) {
		audiostop();
	}
	
	
	document.getElementById("migrants_video").volume = 0;
	migrantsshowprogress = true;
	// $("#m_instructions").fadeOut(1000, function() {
	$("#m_instructions").fadeOut(1000);

	$("#holder").css({'cursor': 'default'}).fadeOut(800, function() {
		
		console.log("[Migrants: migrants_closeinstructions ] m_instructions fadeOut");
		// document.getElementById("migrants_video").volume = 1;
		//_volfade('migrants_video');
		document.getElementById('migrants_video').volume = 0;

		if(m_intervalID !== 0 ){
			clearInterval(m_intervalID);	
		}
		
		m_intervalID = setInterval(fadeInMigrantsAudio,100);
		console.log("SETTING ID TO : " + m_intervalID);

		instructionsOff = true;
		
	});
}

// function migrants_audioready () {
// 	// audio has loaded, let's do this
// 		document.getElementById('migrants_video').volume = 0;
// 		m_intervalID = setInterval(fadeInMigrantsAudio,100);
// }

function migrants_audiostop () {
	clearInterval(m_intervalID);
	m_intervalID = setInterval(fadeOutMigrantsAudio,100);
	audioactive = false;	
}

var fadeInMigrantsAudio = function () {

	// internal function to fade in
	document.getElementById('migrants_video').volume = m_currentVolume / 100;
	m_currentVolume += 5;
	//console.log("Fade Migrants Vol up " + m_currentVolume);
	if(m_currentVolume > m_maxVolume){
		console.log("CLEARING ID : " + m_intervalID);
		clearInterval(m_intervalID);
	}
}

var fadeOutMigrantsAudio = function () {

	// internal function to fade outaudio 
	document.getElementById('migrants_video').volume = m_currentVolume / 100;
	m_currentVolume -= 1;
	//console.log("Fade Migrants Vol down " + m_currentVolume);
	if(_currentaudiovolume == 0){
		clearInterval(m_intervalID);
		document.getElementById('ambientaudio').pause();
	}
}

function m_trackoff() {
	$("#m_instructions").unbind('click');
	$("#holder").unbind('click');
	//not sure whether to turn this off
	// $("#migrantsmore").unbind('click');
	$("#m_container").unbind('mouseenter');
	$("#m_container").unbind('mouseleave');
}

function addMigrantsListeners() {
	//console.log(timecodeArray);
	document.getElementById("migrants_video").addEventListener("canplay", m_loadVideo, true);
	document.getElementById("migrants_video").addEventListener("ended", m_endVids, true);
	document.getElementById("migrants_video").addEventListener("seeked", m_hasLooped, true);
	document.getElementById("migrants_video").addEventListener("timeupdate", m_scrubberUpdater, true);
	document.getElementById("migrants_video").addEventListener("play", m_playVidsCallback, true);
	document.getElementById("migrants_video").addEventListener("pause", m_pauseVidsCallback, true);
	document.getElementById("migrants_video").addEventListener("loadedmetadata", function() {
	}, false);
}

function removeMigrantsListeners() {
	document.getElementById("migrants_video").removeEventListener("canplay", m_loadVideo, true);
	document.getElementById("migrants_video").removeEventListener("ended", m_endVids, true);
	document.getElementById("migrants_video").removeEventListener("seeked", m_hasLooped, true);

	// document.getElementById("migrants_video").removeEventListener("timeupdate", m_scrubberUpdater, true);
	document.getElementById("migrants_video").removeEventListener("play", m_playVidsCallback, true);
	document.getElementById("migrants_video").removeEventListener("pause", m_pauseVidsCallback, true);
	document.getElementById("migrants_video").removeEventListener("loadedmetadata", function() {
	}, false);
}

function m_hasLooped() {
	console.log("migrants has played and restarted");
}

function m_loadVideo () {
	console.log("[ Migrants : Canplaythrough Event ] Video ");
		m_vidLoaded = true;
	console.log("Video loaded ? " + m_vidLoaded);
	progressArcInitPos();

	if(migrantsActive && document.getElementById("migrants_video").paused) {
		m_playButton();
		document.getElementById("migrants_video").volume = 0;
	} else {
		console.log("[m_loadVideo] video is not paused");
	}
}

function m_playButton() {
	if(migrantsActive) {
		 console.log("[ Play Button ] Is Video paused ? "+ document.getElementById("migrants_video").paused);
		if(document.getElementById("migrants_video").paused){
			m_playVids();  
		}
		else{
			//m_pauseVids();
			console.log("[m_playButton] video is already playing");
		}
	} else {
		console.log("[ Migrants: m_playButton ] migrantsActive ? : " + migrantsActive);

	}
}

function m_playVids() {

	if(m_vidLoaded){
		//console.log("[ Migrants : playVids ] videoTrackCurrentPosition = " + videoTrackCurrentPosition);
			var cTime = m_getCurrentTime();
			document.getElementById("migrants_video").currentTime =cTime;
			// document.getElementById("migrants_video").currentTime = document.getElementById("migrants_video").duration -20; ;
			console.log("Video loaded ? " + m_vidLoaded);
			// console.log(test + " : " + document.getElementById("migrants_video").currentTime);
			document.getElementById("migrants_video").play();
			
			m_circleScrubber();
	 }
	 else{
		// console.log("[ Migrants ] Not playing media because? ");
		 console.log("Video loaded ? " + m_vidLoaded);
	 }  
}

function m_getCurrentTime(){
	var d = new Date();
	var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();

	var currentTimeForVideo = currentTimeOfDay % document.getElementById("migrants_video").duration;
	
	//console.log("Current time of Day : " + currentTimeOfDay + " Current time for video : "+ currentTimeForVideo);
	return currentTimeForVideo;

}

function m_pauseVids(){

	currentTime =  document.getElementById("migrants_video").currentTime ;
	m_videoTrackCurrentPosition  = document.getElementById("migrants_video").currentTime;
	//console.log("[ Migrants : pauseVids ] m_videoTrackCurrentPosition = " + m_videoTrackCurrentPosition);

	// audiostop();
	document.getElementById("migrants_video").pause(); 
}

function m_playVidsCallback() {
	// console.log("[ Migrants ] Video playing ? " + document.getElementById("migrants_video").paused);
}

function m_pauseVidsCallback() {
	// console.log("[ Migrants ] Video paused ? " + document.getElementById("migrants_video").paused);

}

function m_endVids() {

	m_pauseVids();
}

//LOOK AT THIS FUNCTION
var m_scrubberUpdater = function () {

	//console.log("[ Migrants: m_scrubberUpdater ]");

	var dur = Math.floor(document.getElementById("migrants_video").currentTime);
	if(dur > 0){
		var ratio = (document.getElementById("migrants_video").duration / dur);
	}
	if(migrantsshowprogress){
	 m_circleScrubber();	
	}
	
	
	m_curtime = document.getElementById("migrants_video").currentTime;
	if(instructionsOff) {
		for (var i = 0; i < timecodeArray.length; i++) {
			if( m_curtime < timecodeArray[i].Maxtime ){

				if( timecodeArray[i].Venn !== prevVenID){
				
				    for(var j=0; j<actFillArray.length; j++){

				    	if(actFillArray[j].vennID === timecodeArray[i].Venn){
				    		//Turn on act Fill
				    		actFillArray[j].actFill.animate({opacity: '1.0'}, 800);
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
				    		
				    		prevVenID = timecodeArray[i].Venn;
				    		// console.log(m_curtime + " : " + timecodeArray[i].Maxtime + " : " + timecodeArray[i].Venn + " : " + prevVenID);
				    		
				    	}
				    	else{
				    		//Turn off Act Fill
							actFillArray[j].actFill.animate({opacity: '0.0'}, 400);
				    	}

					}
					
				}
				// console.log(m_curtime + " : " + timecodeArray[i].Maxtime + " : " + timecodeArray[i].Venn);
				break;	

			}
		};
	} else {
		console.log("still in migrants instructions");
	}

	//console.log("[ Migrants: m_scrubberUpdater ] m_curtime = " + m_curtime);
	//$("#m_progress").css({ "width": (1280 / ratio) + 'px' });

	//amount = ratio * 100;

	//m_circleScrubber();
}

function Fill(_actFill, _vennID) {
	this.actFill = _actFill;
	this.vennID = _vennID;
	// this.actLabel = _actLabel;
}

function m_arrayActFills() {

	vennMap = archtype.set(); 

	var ghan = archtype.path("M151.016,14.703C107.713-8.178,47.436-0.706,16.925,51.2c-30.768,52.341-5.337,112.775,35.211,136.491c0,0-4.502-54.25,48.776-85.542l0,0C102.103,39.941,151.016,14.703,151.016,14.703z"); 
		ghan.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '0'); 
	var ghana_label = archtype.text(60, 25, 'Ghana'); 
		ghana_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1'}); 
	var fill_0 = new Fill(ghan, 0);
	actFillArray.push(fill_0);

	var braz = archtype.path("M154.553,14.703C197.858-8.178,258.134-0.706,288.645,51.2c30.768,52.341,6.904,111.189-33.646,134.904c0,0,2.31-54.126-50.968-85.417l0.04,0.289C202.881,38.768,154.553,14.703,154.553,14.703z"); 
		braz.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '4'); 
	var brazil_label = archtype.text(240, 25, 'Brazil'); 
		brazil_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1'}); 
	var fill_4 = new Fill(braz, 4);
	actFillArray.push(fill_4);

	var suri = archtype.path("M54.016,190.624c2.112,48.932,38.661,96.314,98.65,97.459c60.5,1.154,100.263-50.859,100.263-97.834c0,0-46.332,29.789-100.241-0.4l0,0C98.39,220.228,54.016,190.624,54.016,190.624z"); 
		suri.attr({opacity: '1.0',fill: '#ff5a00', stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '2'); 
	var suriname_label = archtype.text(150, 125, 'Suriname'); 
		suriname_label.attr({fill: '#FFFFFF',"font-family": 'AGaramond',"font-size": '12','stroke-width': '0','stroke-opacity': '1'}); 
	var fill_2 = new Fill(suri, 2);
	actFillArray.push(fill_2);

	var ghan_suri = archtype.path("M54.049,188.727c0,0-2.962-54.283,46.964-84.548c0,0-1.597,54.445,49.528,84.737C150.542,188.916,107.244,217.944,54.049,188.727z"); 
		ghan_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '1'); 
	// var group_g_s = archtype.set();
	// 	group_g_s.push( ghana_label, suriname_label );
	var fill_1 = new Fill(ghan_suri, 1);
	actFillArray.push(fill_1);

	var braz_suri = archtype.path("M252.929,188.042c0,0-46.623,28.983-97.796,0.877c0,0,48.898-27.42,48.553-86.418C203.686,102.5,251.637,127.364,252.929,188.042z"); 
		braz_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '3'); 
	// var group_s_b = archtype.set();
	// 	group_s_b.push( suriname_label, brazil_label );
	var fill_3 = new Fill(braz_suri, 3);
	actFillArray.push(fill_3);

	var ghan_braz = archtype.path("M152.602,15.72c0,0,48.271,25.799,49.519,84.169c0,0-48.351-29.993-98.954,0.922C103.167,100.812,100.701,47.178,152.602,15.72z"); 
		ghan_braz.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '5'); 
	// var group_g_b = archtype.set();
	// 	group_g_b.push( ghana_label, brazil_label );
	var fill_5 = new Fill(ghan_braz, 5);
	actFillArray.push(fill_5);

	var ghan_braz_suri = archtype.path("M102.974,103.196c53.163-30.742,99.005-1.572,99.005-1.572c-2.126,62.971-49.312,86.066-49.312,86.066C102.952,158.226,102.974,103.196,102.974,103.196z"); 
		ghan_braz_suri.attr({opacity: '0.8',fill: '#ff5a00',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '6'); 
	// var group_g_b_s = archtype.set();
	// 	group_g_b_s.push( ghana_label, brazil_label, suriname_label );
	var fill_6 = new Fill(ghan_braz_suri, 6);
	actFillArray.push(fill_6);

	var ghan_braz_suri_off = archtype.path("M102.974,103.196c53.163-30.742,99.005-1.572,99.005-1.572c-2.126,62.971-49.312,86.066-49.312,86.066C102.952,158.226,102.974,103.196,102.974,103.196z"); 
		ghan_braz_suri_off.attr({opacity: '0.0',fill: 'none',stroke: 'none',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '0', 'opacity': '0'}).data('id', '7'); 
	var fill_7 = new Fill(ghan_braz_suri_off, 7);
	actFillArray.push(fill_7);

	//console.log(actFillArray);
	
	var circle_u = archtype.circle(102.349, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'vennMap','stroke-opacity': '1'}).data('id', 'circle_u'); 
	vennMap.attr({'name': 'vennMap'}); 
	var group_b = archtype.set(); 
	var circle_v = archtype.circle(202.858, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'group_b','stroke-opacity': '1'}).data('id', 'circle_v'); 
	group_b.attr({'name': 'group_b'}); 
	var group_c = archtype.set(); 
	var circle_w = archtype.circle(153.553, 188.729, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '1.35',"stroke-miterlimit": '1',"stroke-dasharray": '.',parent: 'group_c','stroke-opacity': '1'}).data('id', 'circle_w'); 
	group_c.attr({'name': 'group_c'}); 
	var holderGroups = [vennMap, group_b, group_c]; 
	
	vennMap.push( circle_u, circle_v, circle_w, ghan, braz, suri, braz_suri, ghan_suri, ghan_braz, ghan_braz_suri, ghana_label, brazil_label, suriname_label ); 
	// group_b.push( circle_v ); 
	// group_c.push( circle_w );
	var centerW;
	var centerH;
	if (height < 700) {
		centerW = width/2 * 0.535;
		centerH = height/2 * 0.525;
		vennMap.transform("T " + centerW + " " + centerH + "S1.2,1.2," + centerW + "," + centerH);
	} else {
		centerW = width/2 * 0.45;
		centerH = height/2 * 0.45;
		vennMap.transform("T " + centerW + " " + centerH + "S1.5,1.5," + centerW + "," + centerH);
	}
	
}

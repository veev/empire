var migrantsLoaded = false;
var migrantsActive = false;
var m_vidLoaded = false;
var m_videoTrackCurrentPosition = 0;
var m_curtime = 0;
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
var progress_arc_gray;
var time_arc;
var time_progress_arc;
var instructionsOff = false;
var progrssCircle; //= rsr.circle(0, 0, 0).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_a','stroke-opacity': '1'}).data('id', 'circle_u'); 
var initPathPos = 0;
var vennMap;	 
//var ratio;

function progressArcInitPos(){
	var initPos;
	var initDur = m_getCurrentTime();
	height = $("#migrants_top").height();
	if(initDur > 0){
		initPos = ( initDur / document.getElementById("migrants_video").duration);
		
		initPos *= 100;

		initPathPos = initPos;
		console.log(initPos);
		// progress_arc.attr({
	 //    	"stroke": "#ff5a00",
	 //    	"stroke-width": 2,
	 //    	arc: [400, height/2, initPos, 100, height/2 - 20]
		// });
		progress_arc_gray.attr({
	    	"stroke": "#888",
	    	"stroke-width": 2,
	    	arc: [400, height/2, initPathPos, 100, height/2 - 50]
		});
	}

}
function m_init(){
	height = $("#migrants_top").height();
	
	radius = height - 40;
	archtype = Raphael("holder", 800, height);
	width = $("#holder").width();
	total_arc = archtype.path();
	progress_arc = archtype.path();
	time_arc = archtype.path();
	time_progress_arc = archtype.path();
	progress_arc_gray = archtype.path();
	progrssCircle = archtype.circle(0, 0, 0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u'); 
	timeCircle = archtype.circle(0,0,0).attr({fill: '#FFFFFF',stroke: '#FFFFFF',"stroke-width": '1','stroke-opacity': '1'}).data('id', 'circle_u');
	var startLine = archtype.path("M400 40 L400 60").attr({stroke: '#fff', "stroke-width": '1','stroke-opacity': '0.6'});
	var twentyfour = archtype.text(400, 10, '24h');
		twentyfour.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'}); 
	var durationTime = archtype.text(400, 38, '22m:06s');
		durationTime.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '18','stroke-width': '0','stroke-opacity': '0.6', 'opacity': '0.6'}); 
	var sixDot = archtype.circle(width/2 + radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});
	var twelveDot = archtype.circle(400, radius + 20, 1).attr({fill: '#FFFFFF', stroke: '#fff','opacity': '0.6'});
	var eighteenDot = archtype.circle(width/2 - radius/2, height/2, 1).attr({fill: '#FFFFFF', stroke: '#fff', 'opacity': '0.6'});


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

	// progress_arc.attr({
 //    	"stroke": "#ff5a00",
 //    	"stroke-width": 2,
 //    	arc: [400, height/2, 0, 100, height/2 - 10]
	// });
	var d = new Date();
	var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();
	var timeProgress = map(currentTimeOfDay, 0, maxTimeOfDay, 0, 100);
	// var initPos;
	// var initDur = Math.floor(document.getElementById("migrants_video").currentTime);
	// if(initDur > 0){
	// 	initPos = ( initDur / document.getElementById("migrants_video").duration);
		
	// 	initPos *= 100;
	// 	// console.log(ration);

	// 	//console.log("[ Migrants: m_scrubberUpdater ] ratio = " + Math.floor(ration));
	// }

	progress_arc.attr({
    	"stroke": "#fff",
    	"stroke-width": 1,
    	arc: [width/2, height/2, 0, 100, height/2 - 50]
	});
	progress_arc_gray.attr({
    	"stroke": "#fff",
    	"stroke-width": 1,
    	arc: [width/2, height/2, initPathPos, 100, height/2 - 50]
	});

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
		arc: [width/2, height/2, 100, 100, height/2-30 ]
	});

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

}
//LOOK AT THIS FUNCTION
function m_circleScrubber() {

	var d = new Date();
	var currentTimeOfDay = d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds();
	var maxTimeOfDay = 24*60*60;

	var timeProgress = map(currentTimeOfDay, 0, maxTimeOfDay, 0, 100);



	time_progress_arc.attr({
    	"stroke": "#fff",
    	"stroke-width": 2,
    	arc: [width/2, height/2, timeProgress, 100, height/2 -30]
	});
	progress_arc_gray.attr({
		"stroke": "#fff",
		"stroke-width": 1,
		arc: [width/2, height/2, initPathPos, 100, height/2 - 50]
	});

	var xloc_ = width/2;
	var yloc_ = height/2;
	var R_ = height/2 - 30;

	var alpha_ = 360 / 100 * timeProgress;
	var a_ = (90 - alpha_) * Math.PI / 180;
	var x_ = xloc_ + R_ * Math.cos(a_);
	var y_ = yloc_ - R_ * Math.sin(a_);		

	timeCircle.animate({cx:x_,cy:y_,r:4},100);

	// console.log(timeProgress);

// var progress_arc = archtype.path().attr({
//     "stroke": "#ff5a00",
//     "stroke-width": 2,
//     arc: [400, height/2, 50, 100, height/2 - 10]
// });	

var ration;
var dur = Math.floor(document.getElementById("migrants_video").currentTime);
	if(dur > 0){
		ration = ( dur / document.getElementById("migrants_video").duration);
		
		ration *= 100;
		// console.log(ration);

		//console.log("[ Migrants: m_scrubberUpdater ] ratio = " + Math.floor(ration));
	}
	if(ration > 0){
		
		progress_arc.attr({
		    "stroke": "#ff5a00",
		    "stroke-width": 1,
		    arc: [width/2, height/2, ration, 100, height/2 - 50]
		});



		var xloc = width/2;
		var yloc = height/2;
		var R = height/2 - 50;

		var alpha = 360 / 100 * ration;
		var a = (90 - alpha) * Math.PI / 180;
		var x = xloc + R * Math.cos(a);
		var y = yloc - R * Math.sin(a);		

		progrssCircle.animate({cx:x,cy:y,r:6},100);
	}
}

function m_dayScrubber() {

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
		$("#minst_2").css({"top": '-16%'});
		$("#minst_3").css({"top": '40%'});
	} else {
		$("#minst_2").css({"top": '-21%'});
		$("#minst_3").css({ "top": '45%'});
	}
	// $("#holder").css({"margin-left": ($("#m_outerouter").width() /2) - 400 });
	// $("#minst_2").css({"margin-left": w/2 - 115, "top": h/2 - 200});
	// $("#minst_3").css({"margin-left": w/2 - 105, "top": h/2 + 200});


	$("#migrantsmore").css({"top": buffer, "left":centering }).fadeIn(4000).on('click', function() {
		body.animate({scrollTop: ($('#migrants_main').offset().top) }, 1000);
		 console.log("migrants_openscreen() in migrantsmore");
		 $("#migrants_video").fadeIn(4000);
		 $("#holder").fadeIn(4000);
		 //m_instructionFills();
		 // m_playVids();
		 // m_arrayActFills();
		 migrants_openscreen();
		 console.log("[ more button click: migrants_openscreen ] instructionsOff ? " + instructionsOff );
		if(!migrantsLoaded) {
			console.log("[Migrants: migrantsmore listener] if not migrantsLoaded, migrants openscreen");
			migrants_openscreen();
		}
	});

	$("#m_container").on('mouseenter', function() {
		//console.log("[migrants video : mouse enter]");
		if(instructionsOff) {
			m_vennMapOn();
		}

	});

	// if(instructionsOff) {
	// 	$("#m_container").on('mouseleave', 'm_vennMapOff');
	// } else {
	// 	$("#m_container").unbind('mouseleave', 'm_vennMapOff');
	// }

	$("#m_container").on('mouseleave', function() {
		//console.log("[migrants video : mouse leave]");
		if(instructionsOff) {
			m_vennMapOff();
		}

	});

	console.log("migrants_sizer");
}

function m_vennMapOn() {
	$("#migrants_video").css({"opacity": 0.5});
	$("#holder").css({"opacity": 1.0});
	$("#migrants_video").css("z-index" , "10");
	$("#holder").css("z-index","20");
}

function m_vennMapOff() {
	$("#migrants_video").css({"opacity": 1});
	$("#holder").css({"opacity": 0});
	$("#migrants_video").css("z-index" , "20");
	$("#holder").css("z-index","10");


}

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
		console.log(localArray[i].Venn);
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
    
    console.log(data);
    return data;
    // loadTimecodeData(data);
	//  $.ajax({
	// 	url: m_url,
	// 	// jsonp: "jsoncallback",
	// 	// jsonpCallback:"foo"
	// 	// type: 'GET',
	// 	success: function(response) {
	// 			//function to put Json into Object
	// 			console.log(response);
	// 			loadTimecodeData(response);
	// 		},

	// 		error: function(err) {
	// 			console.log("GET failed ");
	// 			console.log(err);
	// 		}
	// });
}

// function migrants_openscreen() {
// 	m_playButton();
// }

function migrants_openscreen () {
	instructionsOff = false;
	
	$("#holder").css({'pointer-events' : 'none'}).fadeIn(4000);
	// $("#rsr_instructions").css({"z-index":100}).fadeIn(2000);
	$("#m_instructions").fadeIn(4000, function() {
		if(migrantsActive && document.getElementById("migrants_video").paused) {
			m_playButton();
			document.getElementById("migrants_video").volume = 0;

		}
	});	 
	 //console.log("[Periphery: openscreen ] periphery_closescreen on setTimeout 1");
	//insructIvl = setTimeout("migrants_closescreen()",10000);
	// $("#holder").on('click', function() {
	// 	migrants_closescreen();
	// 	console.log("[ holder click: migrants_closescreen ] instructionsOff ? " + instructionsOff );
	// 	$("#holder").css({'cursor': 'default' , 'pointer-events' : 'none'});
	// });
		
	$("#m_instructions").on('click', function () { 
		//console.log("[ Periphery : periphery_openscreen ] + Calling playbutton in instructions event handler")
		migrants_closescreen(); 
		console.log("[ m_instructions click: migrants_closescreen ] instructionsOff ? " + instructionsOff );
		//console.log("[Periphery: openscreen] periphery_closescreen on instructions click");
	});
	// m_enoughwithinstructions = true;
}

function migrants_closescreen () {
	clearInterval(insructIvl);
	instructionsOff = true;

	if (audioactive) {
		audiostop();
	}
	
	$("#m_instructions").fadeOut(1000, function() {
		console.log("[Migrants: migrants_closescreen ] m_playButton");
		document.getElementById("migrants_video").volume = 1;
		$("#holder").css({'cursor': 'default'});
		// $("#rsr_instructions").css({"z-index":1}).fadeOut();
		//trackMouseRotation(); REPLACE WITH SOMETHING FOR MIGRANTS INTERACTION
		
	});
}

function addMigrantsListeners() {
	console.log(timecodeArray);
	document.getElementById("migrants_video").addEventListener("canplay", m_loadVideo, true);
	document.getElementById("migrants_video").addEventListener("ended", m_endVids, true);
	document.getElementById("migrants_video").addEventListener("timeupdate", m_scrubberUpdater, true);
	// console.log(timecodeArray);
	// $( "#migrants_video" ).bind( "timeupdate", {
	// timecode: timecodeArray
	// }, function( event ) {
	// 	console.log(event);
	// 	console.log("[ Migrants: m_scrubberUpdater ]");

	// var dur = Math.floor(document.getElementById("migrants_video").currentTime);
	// if(dur > 0){
	// 	var ratio = (document.getElementById("migrants_video").duration / dur);
	// }
	
	// m_curtime = document.getElementById("migrants_video").currentTime;
	// console.log(m_curtime +" : "+event.data.timecode[i].length);
	// for (var i = 0; i < timecode[i].length; i++) {
	// 	console.log(m_curtime + " : " + timecode[i]);
	// 	if( m_curtime < timecode[i].Maxtime ){
	// 		console.log(m_curtime + " : " + timecode[i]);
	// 		break;

	// 	}
	// }
	// });
	document.getElementById("migrants_video").addEventListener("play", m_playVidsCallback, true);
	document.getElementById("migrants_video").addEventListener("pause", m_pauseVidsCallback, true);
	document.getElementById("migrants_video").addEventListener("loadedmetadata", function() {
	}, false);
}

function removeMigrantsListeners() {
	document.getElementById("migrants_video").removeEventListener("canplay", m_loadVideo, true);
	document.getElementById("migrants_video").removeEventListener("ended", m_endVids, true);
	// document.getElementById("migrants_video").removeEventListener("timeupdate", m_scrubberUpdater, true);
	document.getElementById("migrants_video").removeEventListener("play", m_playVidsCallback, true);
	document.getElementById("migrants_video").removeEventListener("pause", m_pauseVidsCallback, true);
	document.getElementById("migrants_video").removeEventListener("loadedmetadata", function() {
	}, false);
}

function m_loadVideo () {
	console.log("[ Migrants : Canplaythrough Event ] Video ");
	progressArcInitPos();
	m_vidLoaded = true;

}

function m_playButton() {
	if(migrantsActive) {
		 console.log("[ Play Button ] Is Video paused ? "+ document.getElementById("migrants_video").paused);
		if(document.getElementById("migrants_video").paused){
			m_playVids();  
		}
		else{
			m_pauseVids();
		}
	} else {
		console.log("[ Migrants: m_playButton ] migrantsActive ? : " + migrantsActive);

	}
}

function m_playVids() {
	// if (audioactive) {
	// 	audiostop();
	// }

	if(m_vidLoaded){
		//console.log("[ Migrants : playVids ] videoTrackCurrentPosition = " + videoTrackCurrentPosition);
		// currentTime =  ;
			var test = m_getCurrentTime();
			document.getElementById("migrants_video").currentTime = test ;
			console.log("Video loaded ? " + m_vidLoaded);
			console.log(test + " : " + document.getElementById("migrants_video").currentTime);
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
	m_circleScrubber();
	
	m_curtime = document.getElementById("migrants_video").currentTime;
	if(instructionsOff) {
		for (var i = 0; i < timecodeArray.length; i++) {
			if( m_curtime < timecodeArray[i].Maxtime ){

				if( timecodeArray[i].Venn !== prevVenID){
				
				    for(var j=0; j<actFillArray.length; j++){

				    	if(actFillArray[j].vennID === timecodeArray[i].Venn){
				    		//Turn on act Fill
				    		actFillArray[j].actFill.attr({opacity: '1.0'});
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
				    		console.log(m_curtime + " : " + timecodeArray[i].Maxtime + " : " + timecodeArray[i].Venn + " : " + prevVenID);
				    		
				    	}
				    	else{
				    		//Turn off Act Fill
							actFillArray[j].actFill.attr({opacity: '0.0'});
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

	console.log(actFillArray);
	
	var circle_u = archtype.circle(102.349, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'vennMap','stroke-opacity': '1'}).data('id', 'circle_u'); 
	vennMap.attr({'name': 'vennMap'}); 
	var group_b = archtype.set(); 
	var circle_v = archtype.circle(202.858, 101.852, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '1',"stroke-dasharray": '.', parent: 'group_b','stroke-opacity': '1'}).data('id', 'circle_v'); 
	group_b.attr({'name': 'group_b'}); 
	var group_c = archtype.set(); 
	var circle_w = archtype.circle(153.553, 188.729, 100.51).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '1',"stroke-dasharray": '.',parent: 'group_c','stroke-opacity': '1'}).data('id', 'circle_w'); 
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



/*
function m_instructionFills() {
	rsr_instructions = Raphael('rsr_instructions', '800', '779'); 
	// rsrWidth = $('#migrants_main').width();
	// rsrHeight = $('#migrants_main').height();
	// rsr = ScaleRaphael('rsr', rsrWidth, rsrHeight);
	// rsr.setViewBox(0, 0, rsrWidth, rsrHeight, true);
	// rsr.canvas.setAttribute('preserveAspectRatio', 'none'); 
	var text_r = rsr_instructions.text(0, 0, 'Ghana'); 
		text_r.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		// text_r.transform("m0.3881 -0.9216 0.9216 0.3881 117.8442 292.7422").data('id', 'text_r'); 
		text_r.transform("m0.5 -0.9216 0.9216 0.5 135 250").data('id', 'text_r'); 
	var text_s = rsr_instructions.text(0, 0, 'Brazil'); 
		text_s.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		text_s.transform("m0.51 0.9216 -0.9216 0.51 660 250").data('id', 'text_s'); 
	var text_t = rsr_instructions.text(0, 0, 'Suriname'); 
		text_t.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		// text_t.transform("m1 0 0 1 336.4043 689.3857").data('id', 'text_t'); 
		text_t.transform("m1 0 0 1 400 674").data('id', 'text_t'); 
	var group_a = rsr_instructions.set(); 
	
	var circle_u = rsr_instructions.circle(313, 333, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_a','stroke-opacity': '1'}).data('id', 'circle_u'); 
	group_a.attr({'name': 'group_a'}); 
	var group_b = rsr_instructions.set(); 
	var circle_v = rsr_instructions.circle(484, 333, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_b','stroke-opacity': '1'}).data('id', 'circle_v'); 
	group_b.attr({'name': 'group_b'}); 
	var group_c = rsr_instructions.set(); 
	var circle_w = rsr_instructions.circle(400, 481, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.',parent: 'group_c','stroke-opacity': '1'}).data('id', 'circle_w'); 
	group_c.attr({'name': 'group_c'}); 
	var rsrGroups = [group_a, group_b, group_c]; 
	
	group_a.push( circle_u ); 
	group_b.push( circle_v ); 
	group_c.push( circle_w );
}

function m_actFillsLabels() {
	// rsr = Raphael('rsr', '800', '779');
	// rsrWidth = $('#m_outerouter').width();
	// rsrHeight = $('#m_outerouter').height();
	// var rsr = Raphael("m_outerouter");//ScaleRaphael('rsr', rsrWidth, rsrHeight);
	
	// rsr.setViewBox(0, 0, rsrWidth, rsrHeight, false);
	// rsr.canvas.setAttribute('preserveAspectRatio', 'none'); 
	 

	var ghan = rsr_instructions.path("M397.379,185.141 c-73.816-39.003-178.272-26.266-230.282,62.214c-52.447,89.223-9.097,192.24,60.023,232.668c0,0-7.675-92.478,83.144-145.818l0,0 C312.294,228.164,397.379,185.141,397.379,185.141z"); 
		ghan.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '0'); 
	var fill_0 = new Fill(ghan, 0);
	actFillArray.push(fill_0);

	var ghan_suri = rsr_instructions.path("M230.38,481.788c0,0-5.049-92.532,80.057-144.123 c0,0-3.205,96.181,85.562,144.533C396,482.198,321.059,531.596,230.38,481.788z"); 
		ghan_suri.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '1'); 
	var fill_1 = new Fill(ghan_suri, 1);
	actFillArray.push(fill_1);

	var suri = rsr_instructions.path("M229.47,483.977 c3.602,83.409,66.471,167.647,169.105,167.87c103.496,0.225,171.9-88.848,171.899-168.923c0,0-80.055,52.24-171.95,0.777l0,0 C305.966,535.487,229.47,483.977,229.47,483.977z"); 
		suri.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '2'); 
	var fill_2 = new Fill(suri, 2);
	actFillArray.push(fill_2);
	
	var braz_suri = rsr_instructions.path("M569.401,480.621c0,0-79.477,49.408-166.709,1.498 c0,0,85.264-46.68,82.754-147.731C485.446,334.388,567.196,377.188,569.401,480.621z"); 
		braz_suri.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '3'); 
	var fill_3 = new Fill(braz_suri, 3);
	actFillArray.push(fill_3);
	
	var braz = rsr_instructions.path("M400,185.141 c73.816-39.003,178.272-26.266,230.282,62.214c52.447,89.223,11.098,191.24-58.023,231.668c0,0,4.676-93.478-86.144-146.818l0,0 C484.085,226.164,400,185.141,400,185.141z"); 
		braz.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '4'); 
	var fill_4 = new Fill(braz, 4);
	actFillArray.push(fill_4);

	var ghan_braz = rsr_instructions.path("M398.379,186.875c0,0,82.526,44.125,84.651,143.625 c0,0-83.058-50.5-169.316,2.198C313.714,332.698,309.905,240.5,398.379,186.875z"); 
		ghan_braz.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '5'); 
	var fill_5 = new Fill(ghan_braz, 5);
	actFillArray.push(fill_5);
	
	var ghan_braz_suri = rsr_instructions.path("M313.779,335.99c90.626-52.404,169.251-2,169.251-2 c-3.625,107.344-84.506,146.711-84.506,146.711C313.779,433,313.779,335.99,313.779,335.99z"); 
		ghan_braz_suri.attr({opacity: '0.8',fill: '#FFFFFF',stroke: '#231F20',"stroke-miterlimit": '10','stroke-width': '0','stroke-opacity': '1', 'opacity': '0'}).data('id', '6'); 
	var fill_6 = new Fill(ghan_braz_suri, 6);
	actFillArray.push(fill_6);
	
	//actFillArray.push(rsr_instructions);
	console.log(actFillArray);	

	var text_r = rsr_instructions.text(0, 0, 'Ghana'); 
		text_r.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		// text_r.transform("m0.3881 -0.9216 0.9216 0.3881 117.8442 292.7422").data('id', 'text_r'); 
		text_r.transform("m0.5 -0.9216 0.9216 0.5 135 250").data('id', 'text_r'); 
	var text_s = rsr_instructions.text(0, 0, 'Brazil'); 
		text_s.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		text_s.transform("m0.51 0.9216 -0.9216 0.51 660 250").data('id', 'text_s'); 
	var text_t = rsr_instructions.text(0, 0, 'Suriname'); 
		text_t.attr({fill: '#FFFFFF',"font-family": 'AGaramond-Italic',"font-size": '24','stroke-width': '0','stroke-opacity': '1'}); 
		// text_t.transform("m1 0 0 1 336.4043 689.3857").data('id', 'text_t'); 
		text_t.transform("m1 0 0 1 400 674").data('id', 'text_t'); 
	
	var group_a = rsr_instructions.set(); 
	
	var circle_u = rsr_instructions.circle(313, 333, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_a','stroke-opacity': '1'}).data('id', 'circle_u'); 
	group_a.attr({'name': 'group_a'}); 
	var group_b = rsr_instructions.set(); 
	var circle_v = rsr_instructions.circle(484, 333, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.', parent: 'group_b','stroke-opacity': '1'}).data('id', 'circle_v'); 
	group_b.attr({'name': 'group_b'}); 
	var group_c = rsr_instructions.set(); 
	var circle_w = rsr_instructions.circle(400, 481, 171).attr({fill: 'none',stroke: '#FFFFFF',"stroke-width": '2',"stroke-miterlimit": '10',"stroke-dasharray": '.',parent: 'group_c','stroke-opacity': '1'}).data('id', 'circle_w'); 
	group_c.attr({'name': 'group_c'}); 
	var rsrGroups = [group_a, group_b, group_c]; 
	
	group_a.push( circle_u ); 
	group_b.push( circle_v ); 
	group_c.push( circle_w );
}
*/

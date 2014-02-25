var cradle_x = 0;
var cradle_y = 0;

var xMargin = 10;
var yMargin = 480;
var imgWidth = 960;
var imgHeight = 540;
var innercount = 3;

//these were declared in empirecore.js, now cradle.js doesn't know about that
var audioactive = false;
var _ammobile = false;

var c_controls = false;
var vid1Loaded = false;
var vid2Loaded = false;
var c_playState = 0;
//var xMouseTracking = false;
var mouseXTracking = false;
var instructionsin = false;
var c_enoughwithinstructions = false;
var flipside = false;
var flipangle = 0;
var flipblockIvl = new Number();
var flipblock = false;
var openIvl = new Number();
var lazywidth = 0;
var _curtime = 0;
var _seektime = 0;
var _inseek = false;
var _trackingon = false;
var c_leftpoint = 0;
var c_rightpoint = 0;
var soundivl = new Number();
var c_sidetracker = new Object(); // tracking element to get the visualisation later
var currentvideo = 1; // this is only used in mobile
var c_currentvideoid = 'video1'; // this is only used in mobile
var hlsvideoprefix = 'http://s3.amazonaws.com/empireproj/hls/1000/'; // in mobile we redraw these and use the stills instead
var videoprefix = 'http://s3.amazonaws.com/empireproj/cradle/'; // in mobile we redraw these and use the stills instead
//var videoprefix = 'mp4/'; // in mobile we redraw these and use the stills instead

var _transitiontimer = new Number();
var _transitiontimerIvl = new Number();

c_videoTrackCurrentPosition = 0; 



function mobile_stills (tim) {	

	if(tim >= 1){
		$("#cradle0img").attr('src','art/thumbs/full-schipol-' + Math.floor(tim) + '.jpg');
		$("#cradle1img").attr('src','art/thumbs/full-spotters-' + Math.floor(tim) + '.jpg');
	}
}

function c_playhandler () {
	// c_playState = 1;
	// console.log("c_playhandler c_playState: "+ c_playState);
	// cradle_closescreen();
	// document.getElementById("mobileisgreat").controls = false;
	// if(!c_controls){
	// 	c_enablecontrols();
	// }
}

function c_loadVideo() {
	//console.log("[ Cradle : c_loadVideo ] Loaded Video1 Callback fired");
	vid1Loaded = true;
}

function c_loadVideo2() {
	//console.log("[ Cradle : c_loadVideo2 ] Loaded Video2 Callback fired");
	vid2Loaded = true;
}

function c_canPlayThroughCallback(evt){
	if(evt.target.id == "video1"){
		vid1Loaded = true;
		//console.log(" [ " + evt.target.id + " ] " + " loaded?  canplay callback " + vid1Loaded);
	}

	if(evt.target.id == "video2"){
		vid2Loaded = true;
	 	//console.log(" [ " + evt.target.id + " ] " + " loaded? canplay callback " + vid2Loaded);
	}
	// console.log(evt.target);
}

function c_playVidsCallback(evt){
	mouseXTracking = true;
	//console.log("[ Cradle : c_playVidsCallback ] : Mouse tracking enabled" );
}

function c_pauseVidsCallback(evt){
	mouseXTracking = true;
	//console.log("[ Cradle : c_pauseVidsCallback ] : Mouse tracking enabled" );
}




function c_enablecontrols () {

	c_controls = true;

	if(_ammobile){
		trackon();	
	} else {
		//console.log('bbbbbzzz');
		$("#c_outerouter").on('mouseenter', function () {
			if(mouseXTracking) {
				//console.log("Track on");
				trackon();
			} else {
				//console.log('mouseenter');
			}
			//console.log('xMouseTracking: '+xMouseTracking);
		});

		$("#c_outerouter").on('mouseleave', function () {
			c_trackoff();
			//xMouseTracking = false;
			//console.log('mouseleave');
		});	
	}
	$("#leftbutton").on('click', function () {
		if(flipside){
			flipper();
		}
	});
	$("#rightbutton").on('click', function () {
		if(!flipside){
			flipper();
		}
	});
	// console.log("c_controls are: " + c_controls);
}

function c_disablecontrols () {
	$("#c_outerouter").unbind("mouseenter");
	$("#c_outerouter").unbind("mouseleave");
	$("#leftbutton").unbind("click");
	$("#rightbutton").unbind("click");
	c_controls = false;
	// console.log("controls are: " + c_controls);

}


function cradle_scrollsnaphandle () {
	if($(this).attr('id') == "cradle_main"){
		if(!c_enoughwithinstructions){
			if(!_ammobile){
				// c_playDecide();           
				//c_playButton();
			} else {
				console.log("MOBILE");
			}
			cradle_openscreen();
		}
	}
}

// $(window).resize(function () {

// 	cradle_sizer();
// 	lazywidth = $("#c_outerouter").width();
// 	var marginsize = (lazywidth - 960) / 2;
// 	c_leftpoint = marginsize + 180;
// 	c_rightpoint = (lazywidth - marginsize) - 180;
// });

function cradle_openscreen () {

	$("#c_instructions").fadeIn(2000);
	if(_ammobile){
		
		$("#ctitle").show();
		$("#c_instructions").css({ 'pointer-events':'none' });
	} else {
		//console.log("[ Cradle: openscreen ] cradle_closescreen on setTimeout 1");
		openIvl = setTimeout("cradle_closescreen()",10000);
	}
	$("#c_instructions").on('click', function () { 
		//console.log("[ instructions ] Calling play button")
		//c_playButton();
		cradle_closescreen();
		//console.log("[Cradle: cradle_openscreen] cradle_closescreen on instructions click");
		trackon();
	});
	// openIvl = setTimeout("cradle_closescreen()",10000);
	// console.log("[Cradle: openscreen ] cradle_closescreen on setTimeout 2");
	c_enoughwithinstructions = true;
}

function cradle_closescreen () {
	clearInterval(openIvl);
	$("#c_instructions").fadeOut(1000, function() {
		//console.log("[ Cradle : cradle_closescreen ] close instructions");
		if(cradleActive && document.getElementById("video1").paused){
		 c_playButton();	
		}
		
		trackon();
	});
}

function cradle_sizer () {

	var matop = ($("#cradle_top").height() / 2) - 220; // top of the matrix
	var padtop = 84; // top of the main title
	var legbottom = 60; //offset of the bottom play button on the open screen
	var body = $('html body');

	// if($("#cradle_top").height() < 780){ // if this a wee screen
	// 	padtop = 10;
	// 	matop = 120;
	// 	legbottom = 20;
	// }

	// body.css({'background': '#000'});
	// $("#cradle_top").setHeight()
	// $("#cradle_top").width() *= window.width;
	console.log("cradle_top height: " + $("#cradle_top").height() );

	$("#c_outerouter").css({ 'padding-top': (($("#cradle_top").height() / 2) - ($("#c_outerinner").height() / 2)) });
	console.log("padding-top: " + (($("#cradle_top").height() / 2) - ($("#c_outerinner").height() / 2)));

	$("#cradle_bottom").css("height",$("#cradle_top").height());

	$('#cradle_line').css({ 'top': matop, 'height': ($("#cradle_top").height() - matop), 'left': (($("#cradle_top").width() / 2) - 7) });
	$("#cradle_linewhite").css({ 'height': $("#cradle_main").height(), 'left': (($("#cradle_top").width() / 2) - 7) });
	$('#cradle_bottomline').css({ 'top': 0, 'height': ($("#cradle_bottom").height() - 160), 'left': (($("#cradle_top").width() / 2) - 7) });
	
	$("#cradle_title").css({ 'padding-top': padtop });

	$("#cradle_structure").css({ 'margin-top': matop, 'left': (($("#cradle_top").width() / 2) - 370) });
	$("#cbottom_structure").css({ 'margin-top': ((($("#cradle_bottom").height() - 160) / 2) - 235), 'left': (($("#cradle_top").width() / 2) - 465) - 5 });

	$("#c_legmore").css({ "margin-left": ($("#cradle_main").width() / 2) - 70 }).on('click', function() {
		body.animate({scrollTop: ($("#cradle_bottom").offset().top)}, 1000);
	});

	// $("#cradleplay").css({ "bottom": legbottom, "margin-left": ($("#cradle_top").width() / 2) - 70 }).fadeIn(4000).click(function () {
	// 	$('html, body').animate({ scrollTop: ($('#cradle_main').offset().top) }, 1000);
	// 	if(!_ammobile){
	// 		c_playDecide();
	// 	}
	// 	cradle_openscreen();
	// });

	$("#cradlemore").css({"bottom": legbottom, "margin-left": ($("#cradle_top").width() / 2) - 70 }).fadeIn(4000).on('click', function() {
		body.animate({scrollTop: ($('#cradle_main').offset().top) }, 1000);
		// console.log("cradle_openscreen() in cradlemore");
		if(!cradleLoaded) {
			//console.log("[Cradle: cradlemore listener] if not cradleLoaded, cradle openscreen");
			cradle_openscreen();
		}
	
		// if(!mouseXTracking) {
		// 	$("#c_instructions").fadeIn('fast');
		// } else {
		// 	console.log("already loaded instructions");
		// }
	});

	 $("#cradle_returnTop").css({'margin-top': ((($("#cradle_bottom").height() - 160) / 2) - 330), "margin-left": ($("#cradle_bottom").width() / 2) - 70 }).fadeIn(4000).click(function() {
	 	body.animate({scrollTop: ($('#cradle_top').offset().top) }, 1000);
	 });

	// console.log("cradle_sizer");

}

function trackon () {
	_trackingon = true;
	 //console.log("tracking is: " + _trackingon);
	$(document).on('mousemove', function(e){
		if(!flipblock){
			var x = e.pageX;
			//console.log("cradle page x: " + x);
			var threshold = lazywidth/2;
			//console.log("lazywidth/2 = " + threshold);
			if(x < (threshold)){
				//console.log("flipside = " + flipside);
				if(flipside){
					//console.log('we are in flipper(false)');
					flipper(false);
				}
			} else {
				if(!flipside){
					//console.log('we are in flipper(true)');
					flipper(true);
				}
			}
		}				
	});
	if(_ammobile){
		$(document).on('swipeleft', function () {
			if(flipside){
				flipper(false);
			}
		});
		$(document).on('swiperight', function () {
			if(!flipside){
				flipper(true);
			}
		});
	}
}

function flipper (isright){
	//console.log('flipper isright = ' + isright + ', flipside = ' + flipside);

	if(flipside){		
		flipside = false;
		flipangle = 0;
		 //console.log("flipside ?" + flipside);
		$("#leftbutton").removeClass('buttonon').addClass('buttonoff');
		$("#rightbutton").removeClass('buttonoff').addClass('buttonon');
	} 
	else {
		flipside = true;
		flipangle = 180;
		// console.log("flipside ?" + flipside);
		$("#rightbutton").removeClass('buttonon').addClass('buttonoff');
		$("#leftbutton").removeClass('buttonoff').addClass('buttonon');
	}
	$("#card").css({ '-webkit-transform': 'rotateY( ' + flipangle + 'deg)', 'transform': 'rotateY( ' + flipangle + 'deg)' });
	
	// log that they did this
	// if(ga){
	// 	var mobilereport = (_ammobile)? 'mobile':'desktop';
	// 	ga('send', 'event', 'cradle', 'flip', mobilereport, _curtime);
	// }
}

function c_trackoff () {
	//console.log('c_trackoff');
	_trackingon = false;
	//console.log("tracking is: " + _trackingon);

	$(document).unbind("swipeleft");
	$(document).unbind("swiperight");
	$(document).unbind('mousemove');
	$(document).unbind('mouseenter');
  	$(document).unbind('mouseleave');
}

function flipmobile (doplay) {
	document.getElementById('mobileisgreat').play();
	if(_inseek && _seektime >= _curtime){
		_inseek = false;
		document.getElementById('mobileisgreat').currentTime = _seektime;
	} else {
		soundup();
		$("#mobilevideo").fadeIn(300);
		document.getElementById('mobileisgreat').removeEventListener('canplay', flipmobile);
		document.getElementById('mobileisgreat').removeEventListener('playing', flipmobile);
		clearInterval(_transitiontimerIvl);
		// log the lag
		// if(ga){
		// 	ga('send', 'event', 'cradle', 'flip lag', 'mobile', (_transitiontimer / 5));
		// }
	}
}

function c_playDecide(){
//	document.getElementById("video2").volume = 0;
	//console.log("Playing cradle videos");
  // if(p_vidLoaded){
	// if(vid1Loaded && vid2Loaded){
	// 	c_playVids();
	// 	c_playState = 1;
	// 	// console.log("c_playDecide c_playState: "+ c_playState);
	// 	xMouseTracking = true;
	// 	// console.log("c_playDecide xMouseTracking: " + xMouseTracking);
	// 	trackon();
	// } else {
	// 	//console.log("Not Playing videos");
	// 	setTimeout("c_playDecide()",800);
	// }
}

function c_restartVids() {	
	//c_playDecide();
	// c_playState = 1;
	//console.log("Restarting cradle videos");
	document.getElementById("video1").currentTime = 0;
	document.getElementById("video2").currentTime = 0;
	document.getElementById("video2").volume = 0;
	document.getElementById("video1").play();
	document.getElementById("video2").play();

}

function addCradleListeners() {
	document.getElementById("video1").addEventListener("canplay", c_loadVideo, true);
	document.getElementById("video2").addEventListener("canplay", c_loadVideo2, true);
	document.getElementById("video1").addEventListener("ended", c_endVids, true);
	document.getElementById("video2").addEventListener("ended", c_endVids, true);
	document.getElementById("video1").addEventListener("timeupdate", c_scrubberUpdater, true);
	document.getElementById("video2").addEventListener("timeupdate",c_scrubberUpdater(),false);
	document.getElementById("video1").addEventListener("play", c_playVidsCallback, true);
	document.getElementById("video2").addEventListener("play", c_playVidsCallback, true);
	document.getElementById("video1").addEventListener("pause", c_pauseVidsCallback, true);
	document.getElementById("video2").addEventListener("pause", c_pauseVidsCallback, true);
	//console.log("added Cradle Listeners");
}

function removeCradleListeners() {
	document.getElementById("video1").removeEventListener("canplay", c_loadVideo, true);
	document.getElementById("video2").removeEventListener("canplay", c_loadVideo2, true);
	document.getElementById("video1").removeEventListener("ended", c_endVids, true);
	document.getElementById("video2").removeEventListener("ended", c_endVids, true);
	document.getElementById("video1").removeEventListener("timeupdate", c_scrubberUpdater, true);
	document.getElementById("video2").removeEventListener("timeupdate",c_scrubberUpdater(),false);
	document.getElementById("video1").removeEventListener("play", c_playVidsCallback, true);
	document.getElementById("video2").removeEventListener("play", c_playVidsCallback, true);
	document.getElementById("video1").removeEventListener("pause", c_pauseVidsCallback, true);
	document.getElementById("video2").removeEventListener("pause", c_pauseVidsCallback, true);
}

function c_playButton(){
	if(cradleActive) {
		mouseXTracking = true;

		// console.log("[ Cradle: Play Button ]  Was Video1 paused ? "+ document.getElementById("video1").paused);
		// console.log("[ Cradle: Play Button ]  Was Video2 paused ? "+ document.getElementById("video2").paused);
		// console.log("[ Cradle: Play Button ] tracking enabled? " + mouseXTracking );

		// xMouseTracking = true;
		if(document.getElementById("video1").paused || document.getElementById("video2").paused){
			c_playVids();
		}
		else{
			c_pauseVids();
		}
	}
	else {
		// console.log("[ Cradle: c_playButton ] cradleActive ? : " + cradleActive);
	}

}

function c_playVids(){
	if(audioactive){
		audiostop();
		// console.log("[ Cradle: c_playVids ] audiostop()");
	}

	if(_ammobile){

		document.getElementById("mobileisgreat").play();

	} 
	else if(vid1Loaded && vid2Loaded ){
		
		document.getElementById("video1").currentTime = c_videoTrackCurrentPosition;
		document.getElementById("video2").currentTime = c_videoTrackCurrentPosition;
		document.getElementById("video1").play();
		document.getElementById("video2").volume = 0;
		document.getElementById("video2").play();
		// console.log("[ Cradle: c_playVids ] ");
	
	}
	else{
  // 	console.log("[ Cradle: c_playVids ] Not playing media because? ");
  //   	console.log("[ Cradle: c_playVids ] Video1 loaded ? " +vid1Loaded);
  //   	console.log("[ Cradle: c_playVids ] Video2 loaded ? " + vid2Loaded);
	}

	
    // console.log("c_playVids xMouseTracking = " + xMouseTracking);
}

function c_pauseVids(){
	if(_ammobile){
		document.getElementById("mobileisgreat").pause();
	} else {
		c_videoTrackCurrentPosition = document.getElementById("video1").currentTime;
		document.getElementById("video1").pause();
		document.getElementById("video2").pause();
		// console.log("[ Cradle: c_pauseVids ] ");
		//console.log("cradle paused");
		//console.log(document.getElementById("video1").pause);		
	}
	// c_playState = 2;
	// console.log("c_pauseVids c_playState: " + c_playState);
}

function c_endVids(){
	c_playState = 3;
	//console.log("c_endVids c_playState: " + c_playState);
	//console.log(evt);
	c_buildendscreen();
}

function sounddown () {
	clearInterval(soundivl);
	soundivl = setInterval(function () {
		var thisvol = document.getElementById('mobileisgreat').volume - .2;
		document.getElementById('mobileisgreat').volume = thisvol;
		if(thisvol < .1){
			clearInterval(soundivl);
		}
	},50);
}

function soundup () {
	clearInterval(soundivl);
	soundivl = setInterval(function () {
		var thisvol = document.getElementById('mobileisgreat').volume + .2;
		if(thisvol > .5){
			clearInterval(soundivl);
			thisvol = .6;
		}
		document.getElementById('mobileisgreat').volume = thisvol;
	},50);
}

function c_scrubberUpdater (){

	var dur = Math.floor(document.getElementById(c_currentvideoid).currentTime);
	if(dur > 0){
		var ratio = (document.getElementById(c_currentvideoid).duration / dur);
	}
	
	_curtime = document.getElementById(c_currentvideoid).currentTime;

	$("#c_progress").css({ "width": (930 / ratio) + 'px' });
	c_sidetracker[Math.floor(document.getElementById(c_currentvideoid).currentTime)] = flipside;
	
	if(_ammobile && dur > 0){
		mobile_stills(dur);

		if(_inseek){
			flipmobile(true);
		}
	}
}

function c_buildendscreen () {
	//console.log("[ Cradle ] c_buildendscreen");
	$("#c_container").hide();
	$("#c_controls").hide();
	$("#c_endscreen").fadeIn();
	
	$("#c_legmore").fadeIn();
	
	if(_ammobile){
		c_trackoff();
	}
	
	// now the drawing
	var outputstring = new String();
	var nowtop = 0;
	var multiplier = 1.756;
	
	for(var x = 0; x < 446; x++){

		outputstring += '<div style="width: 445px; ';
		var rightnow = c_sidetracker[x];
		var accum = 1;
		while(c_sidetracker[x] == rightnow){
			accum++;
			x++;	
			if(x > 446){
				break;
			}
		}
		outputstring += 'height: ' + (accum * multiplier) + 'px';
		if(rightnow == false){
			outputstring += '; left: 445';
		}
		outputstring += '; top: ' + nowtop + '"></div>';
		nowtop = nowtop + (accum * multiplier);
	}
	
	
	// log that they got to the end here
	// if(ga){
	// 	var mobilereport = (_ammobile)? 'mobile':'desktop';
	// 	ga('send', 'event', 'cradle', 'endscreen', mobilereport);
	// }

	
	$("#c_people_data").html(outputstring);
	
	// click on the overlay, party's over
	$("#c_person_overlay").click(function () {
		c_sidetracker = {};
		$("#c_endscreen").fadeOut();
		$("#c_legmore").fadeOut();
		

		if(_ammobile){
			document.getElementById("mobileisgreat").currentTime = 0;
		} else {
			document.getElementById("video1").currentTime = 0;
			document.getElementById("video2").currentTime = 0;
		}

		$("#c_container").fadeIn();
		$("#c_controls").fadeIn();

		c_playVids();

		$("#c_playElement").css({'background':'url(../../art/cradle/playWhite.png)'})
		//c_playState = 1;	
		console.log("c_buildendscreen c_playState: " + c_playState);					
	});
}
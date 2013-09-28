var cradle_x = 0;
var cradle_y = 0;

var xMargin = 10;
var yMargin = 480;
var imgWidth = 960;
var imgHeight = 540;
var innercount = 3;

var _controls = false;
var vid1Loaded = false;
var vid2Loaded = false;
var playState = 0;
var instructionsin = false;
var enoughwithinstructions = false;
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
var leftpoint = 0;
var rightpoint = 0;
var soundivl = new Number();
var sidetracker = new Object(); // tracking element to get the visualisation later
var currentvideo = 1; // this is only used in mobile
var currentvideoid = 'video1'; // this is only used in mobile
var hlsvideoprefix = 'http://s3.amazonaws.com/empireproj/hls/1000/'; // in mobile we redraw these and use the stills instead
var videoprefix = 'http://s3.amazonaws.com/empireproj/cradle/'; // in mobile we redraw these and use the stills instead
//var videoprefix = 'mp4/'; // in mobile we redraw these and use the stills instead


$(document).ready(function(){		

	if(navigator.userAgent.indexOf('WebKit') == -1 && navigator.userAgent.indexOf('Firefox') == -1){
		$('body:first').append('<div id="browserno" style="display: none;"><div class="padded">Sorry, this experiment is only currently working in Google Chrome, Apple\'s Safari and Firefox. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
		$("#browserno").slideDown();
	}

	lazywidth = $("#outerouter").width();
	
	cradle_sizer();

	$(document).scrollsnap({
		snaps: '.snap',
		proximity: 180,
		handler: cradle_scrollsnaphandle
	});


	if(_ammobile){

//		$("#playElement").css({'background':'url(art/playWhite.png)'})
			
		// if we're mobile let's get drastic: dump the video and run stills in both cards, then run the video over it

		$("#video1").remove();
		$("#video2").remove();
		
		
		if(_canhls){
			$("#mobilevideo").html('<video src="' + hlsvideoprefix + 'schipol_1000.m3u8" id="mobileisgreat" width="960" height="540" poster="art/thumbs/full-schipol-1.jpg" controls>').show();
		}else {
			$("#mobilevideo").html('<video src="' + videoprefix + 'schipol_hinted.mp4" id="mobileisgreat" width="960" height="540" poster="art/thumbs/full-schipol-1.jpg" controls>').show();
		}
		
				
		currentvideoid = 'mobileisgreat';
		
		document.getElementById("mobileisgreat").addEventListener("play", playhandler);
		document.getElementById("mobileisgreat").addEventListener("timeupdate",function(){scrubberUpdater();},true);
		document.getElementById("mobileisgreat").addEventListener("ended",function(){ endVids();},true);

		$("#cradle0").html('<img src="art/thumbs/full-schipol-1.jpg" id="cradle0img" width="960" height="540" alt="" />');
		$("#cradle1").html('<img src="art/thumbs/full-spotters-1.jpg" id="cradle1img" width="960" height="540" alt="" />');


	} else {
	
		currentvideoid = 'video1';
		document.getElementById("video1").addEventListener("canplay",function(){vid1Loaded = true; },true);
		document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
		document.getElementById("video1").addEventListener("ended",function(){ endVids();},true);
		document.getElementById("video1").addEventListener("timeupdate",function(){scrubberUpdater();},true);
		enablecontrols();

	}
	
	$(document).keydown(function (e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (key == 32){
       e.preventDefault();
    	if(playState == 1 || playState == 2){
    		playButton();
    	}
    }
 	});
	
$("#playElement").click(function () {
	playButton();
}).mouseover(function (){
	if(playState == 1){
		$("#playElement").css({'background':'url(art/pauseWhite.png)'})
	} else {				
		$("#playElement").css({'background':'url(art/playWhite.png)'})
	}
}).mouseout(function (){
		if(playState == 1){
			$("#playElement").css({'background':'url(art/playWhite.png)'})
		} else {				
			$("#playElement").css({'background':'url(art/pauseGray.png)'})
		}
});

	cradle_openscreen();

});

function mobile_stills (tim) {	

	if(tim >= 1){
		$("#cradle0img").attr('src','art/thumbs/full-schipol-' + Math.floor(tim) + '.jpg');
		$("#cradle1img").attr('src','art/thumbs/full-spotters-' + Math.floor(tim) + '.jpg');
	}
	
}

function playhandler () {
	playState = 1;
	cradle_closescreen();
	document.getElementById("mobileisgreat").controls = false;
	if(!_controls){
		enablecontrols();
	}
}

function enablecontrols () {

	_controls = true;

	if(_ammobile){
		trackon();	
	} else {
		$("#outerouter").mouseenter(function () {
			trackon();
			console.log('mouseenter');
		});

		$("#outerouter").mouseleave(function () {
			trackoff();
			console.log('mouseleave');
		});	
	}
	
	$("#leftbutton").click(function () {
		if(flipside){
			flipper();
		}
	});
	$("#rightbutton").click(function () {
		if(!flipside){
			flipper();
		}
	});

}

function disablecontrols () {
	$("#outerouter").unbind("mouseenter");
	$("#outerouter").unbind("mouseleave");
	$("#leftbutton").unbind("click");
	$("#rightbutton").unbind("click");
	_controls = false;
}


function cradle_scrollsnaphandle () {
	if(playState == 0 && $(this).attr('id') == "cradle_main"){
		if(!enoughwithinstructions){
			if(!_ammobile){
				playDecide();
			}
			cradle_openscreen();
		}
	}
}

$(window).resize(function () {
	cradle_sizer();
	lazywidth = $("#outerouter").width();
	var marginsize = (lazywidth - 960) / 2;
	leftpoint = marginsize + 180;
	rightpoint = (lazywidth - marginsize) - 180;
});

function cradle_openscreen () {
	$("#instructions").fadeIn(2000);
	if(_ammobile){
		$("#ctitle").show();
		$("#instructions").css({ 'pointer-events':'none' });
	} else {
	openIvl = setTimeout("cradle_closescreen()",10000);
	}
	$("#instructions").click(function () { if(!_ammobile){ playDecide() } cradle_closescreen(); });
	openIvl = setTimeout("cradle_closescreen()",10000);
	enoughwithinstructions = true;
}

function cradle_closescreen () {
	clearInterval(openIvl);
	$("#instructions").fadeOut(1000);
}

function cradle_sizer () {

	var matop = ($("#cradle_top").height() / 2) - 220; // top of the matrix
	var padtop = 84; // top of the main title
	var legbottom = 60; //offset of the bottom play button on the open screen
	
	if($("#cradle_top").height() < 780){ // if this a wee screen
		padtop = 10;
		matop = 120;
		legbottom = 20;
	}
	
	$("#outerouter").css({ 'padding-top': (($("#cradle_top").height() / 2) - ($("#outerinner").height() / 2)) });
	
	$("#cradle_bottom").css("height",$("#cradle_top").height());

	$('#cradle_line').css({ 'top': matop, 'height': ($("#cradle_top").height() - matop), 'left': (($("#cradle_top").width() / 2) - 7) });
	$("#cradle_linewhite").css({ 'height': $("#cradle_main").height(), 'left': (($("#cradle_top").width() / 2) - 7) });
	$('#cradle_bottomline').css({ 'top': 0, 'height': ($("#cradle_bottom").height() - 160), 'left': (($("#cradle_top").width() / 2) - 7) });
	
	$("#cradle_title").css({ 'padding-top': padtop });

	$("#cradle_structure").css({ 'margin-top': matop, 'left': (($("#cradle_top").width() / 2) - 370) });
	$("#cbottom_structure").css({ 'margin-top': ((($("#cradle_bottom").height() - 160) / 2) - 235), 'left': (($("#cradle_top").width() / 2) - 465) - 5 });

	$("#legmore").css({ "margin-left": ($("#cradle_main").width() / 2) - 70 });

	$("#cradleplay").css({ "bottom": legbottom, "margin-left": ($("#cradle_top").width() / 2) - 70 }).fadeIn(4000).click(function () {
		$('html, body').animate({ scrollTop: ($('#cradle_main').offset().top - 20) }, 1000);
		if(!_ammobile){
			playDecide();
		}
		cradle_openscreen();
	});

}
function trackon () {
	_trackingon = true;
	$(document).mousemove(function(e){
		if(!flipblock){
			var x = e.pageX;
			if(x < (lazywidth / 2)){
				if(flipside){
					flipper(false);
				}
			} else {
				if(!flipside){
					flipper(true);
				}
			}
		}				
	});
	$(document).swipeleft(function () {
		if(flipside){
			flipper(false);
		}
	});
	$(document).swiperight(function () {
		if(!flipside){
			flipper(true);
		}
	});
}

function trackoff () {
//	console.log('trackoff');
_trackingon = false;
	$(document).unbind("swipeleft");
	$(document).unbind("swiperight");
	$(document).unbind('mousemove');
}

function flipper (isright){
//	console.log('flipper ' + isright + ' ' + flipside);
	if(_ammobile){
		mobile_stills(_curtime);
		var newclip = (flipside)? 'schipol':'spotters';
		sounddown();
		if(_canhls){
			document.getElementById('mobileisgreat').src = hlsvideoprefix + newclip + '_1000.m3u8#t=' + _curtime;
		} else {
			document.getElementById('mobileisgreat').src = videoprefix + newclip + '_hinted.mp4#t=' + _curtime;
		}
		_seektime = _curtime;
//		console.log(videoprefix + newclip + '.mp4#t=' + _curtime);
//		console.log(document.getElementById('mobileisgreat').src); 
		document.getElementById('mobileisgreat').addEventListener('canplay', flipmobile);
//		document.getElementById('mobileisgreat').addEventListener('playing', flipmobile);
		document.getElementById('mobileisgreat').volume = .6;
		_inseek = true;
		$("#mobilevideo").hide();
	}
	if(flipside){		
		flipside = false;
		flipangle = 0;
		$("#leftbutton").removeClass('buttonon').addClass('buttonoff');
		$("#rightbutton").removeClass('buttonoff').addClass('buttonon');
	} else {
		flipside = true;
		flipangle = 180;
		$("#rightbutton").removeClass('buttonon').addClass('buttonoff');
		$("#leftbutton").removeClass('buttonoff').addClass('buttonon');
	}
	$("#card").css({ '-webkit-transform': 'rotateY( ' + flipangle + 'deg )', 'transform': 'rotateY( ' + flipangle + 'deg )' });
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
	}
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

function scrubberUpdater (){

	var dur = Math.floor(document.getElementById(currentvideoid).currentTime);
	if(dur > 0){
		var ratio = (document.getElementById(currentvideoid).duration / dur);
	}
	
	_curtime = document.getElementById(currentvideoid).currentTime;

	$("#progress").css({ "width": (930 / ratio) + 'px' });
	sidetracker[Math.floor(document.getElementById(currentvideoid).currentTime)] = flipside;
	
	if(_ammobile && dur > 0){
		mobile_stills(dur);

		if(_inseek){
			flipmobile(true);
		}
	}
	
	
}



function playDecide(){
//	document.getElementById("video2").volume = 0;
	if(vid1Loaded && vid2Loaded){
		playVids();
		playState = 1;
	} else {
		setTimeout("playDecide()",800);
	}
}

function playButton(){
//	console.log('playbutton');
	if(playState == 1){
		pauseVids();
		playState = 2;
		$("#playElement").css({'background':'url(art/pauseGray.png)'})
	}
	else if(playState == 2){
		playVids();
		playState = 1;
		$("#playElement").css({'background':'url(art/playWhite.png)'})
	}
	else{
		if(_ammobile){
				document.getElementById("mobileisgreat").currentTime = 0;

		} else {
		
			document.getElementById("video1").currentTime = 0;
			document.getElementById("video2").currentTime = 0;
	
		}
		playVids();
		$("#playElement").css({'background':'url(art/playWhite.png)'})
		playState = 1;				
	}
}

function playVids(){
	if(audioactive){
		audiostop();
	}
	if(_ammobile){

		document.getElementById("mobileisgreat").play();

	} else {
	
		document.getElementById("video1").play();
		document.getElementById("video2").play();
		document.getElementById("video2").volume = 0;
	
	}
}

function pauseVids(){
	if(_ammobile){
		document.getElementById("mobileisgreat").pause();
	} else {
		document.getElementById("video1").pause();
		document.getElementById("video2").pause();
	}
	playState = 2;
}

function endVids(){
	playState = 3;
	buildendscreen();
}

function buildendscreen () {
	$("#container").hide();
	$("#controls").hide();
	$("#endscreen").fadeIn();
	
	$("#legmore").fadeIn();
	
	if(_ammobile){
		trackoff();
	}
	
	// now the drawing
	
	var outputstring = new String();
	var nowtop = 0;
	var multiplier = 1.13;
	
	for(var x = 0; x < 446; x++){

		outputstring += '<div style="width: 445px; ';
		var rightnow = sidetracker[x];
		var accum = 1;
		while(sidetracker[x] == rightnow){
			accum++;
			x++;	
			if(x > 446){
				break;
			}
		}
		outputstring += 'height: ' + (accum * multiplier)+ 'px;';
		if(rightnow == false){
			outputstring += ' left: 445';
		}
		outputstring += '; top: ' + nowtop + '"></div>';
		nowtop = nowtop + (accum * multiplier);
	}
	
	$("#people_data").html(outputstring);
	
	// click on the overlay, party's over
	$("#person_overlay").click(function () {
		sidetracker = {};
		$("#endscreen").fadeOut();
		$("#legmore").fadeOut();

		if(_ammobile){
			document.getElementById("mobileisawesome").currentTime = 0;
		} else {
			document.getElementById("video1").currentTime = 0;
			document.getElementById("video2").currentTime = 0;
		}
		$("#container").fadeIn();
		$("#controls").fadeIn();

		playVids();
		$("#playElement").css({'background':'url(art/playWhite.png)'})
		playState = 1;						
	});
}
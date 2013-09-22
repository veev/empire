var cradle_x = 0;
var cradle_y = 0;

var xMargin = 10;
var yMargin = 480;
var imgWidth = 960;
var imgHeight = 540;

var vid1Loaded = false;
var vid2Loaded = false;
var playState = 0;
var instructionsin = false;
var flipside = false;
var flipangle = 0;
var flipblockIvl = new Number();
var flipblock = false;

$(document).ready(function(){		


	cradle_sizer();

	$(document).scrollsnap({
		snaps: '.snap',
		proximity: 180,
		handler: cradle_scrollsnaphandle
	});


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

	document.getElementById("video1").addEventListener("canplay",function(){vid1Loaded = true; },true);
	document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
	
	document.getElementById("video1").addEventListener("ended",function(){ endVids();},true);
	document.getElementById("video1").addEventListener("timeupdate",function(){scrubberUpdater();},true);
	
	$("#outerinner").mouseenter(function () {
		trackon();
	});

	$("#outerinner").mouseleave(function () {
		trackoff();
	});
	
	$("#playElement").click(function () {
	playButton();
	if(playState == 1){
		$("#playElement").css({'background':'url(art/playGray.png)'})
	} else {				
		$("#playElement").css({'background':'url(art/pauseGray.png)'})
	}
}).mouseover(function (){
	if(playState == 1){
		$("#playElement").css({'background':'url(art/playWhite.png)'})
	} else {				
		$("#playElement").css({'background':'url(art/pauseWhite.png)'})
	}
}).mouseout(function (){
		if(playState == 1){
			$("#playElement").css({'background':'url(art/playGray.png)'})
		} else {				
			$("#playElement").css({'background':'url(art/pauseGray.png)'})
		}
});

	
});

function cradle_scrollsnaphandle () {
	if(playState == 0 && $(this).attr('id') == "cradle_main"){
		playDecide();
	}
}

$(window).resize(function () {
	cradle_sizer();
});

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
	
	$('#cradle_line').css({ 'top': matop, 'height': ($("#cradle_top").height() - matop), 'left': (($("#cradle_top").width() / 2) - 7) });
	$("#cradle_linewhite").css({ 'height': $("#cradle_main").height(), 'left': (($("#cradle_top").width() / 2) - 7) });
	
	$("#cradle_bottom").css("height",$("#cradle_top").height());
	
	$("#cradle_title").css({ 'padding-top': padtop });

	$("#cradle_structure").css({ 'margin-top': matop, 'left': (($("#cradle_top").width() / 2) - 370) });


//	$("#mainarea").css({ "margin-top": matop });
	$("#cradleplay").css({ "bottom": legbottom, "margin-left": ($("#cradle_top").width() / 2) - 70 }).fadeIn(4000).click(function () {
		$('html, body').animate({ scrollTop: ($('#cradle_main').offset().top - 20) }, 1000);
		playDecide();
	});

}

function trackon () {
	$(document).mousemove(function(e){
		if(!flipblock){
			var x = e.pageX - $("#cardover").offset().left;
//			console.log('mousemove ' + flipside + ' ' + x);
			if(x < 480){
				if(x < 180){
					if(flipside){
						flipper(false);
					}
				} else {
					deg = Math.floor(((x - 210) / 3));
					flipangle = deg;
//						console.log(deg);
					$("#card").css({ '-webkit-transform': 'rotateY( ' + deg + 'deg )', 'transform': 'rotateY( ' + deg + 'deg )' });
				}
			}
//			} else {
			if(x > 480){
				if(x > 780){
					if(!flipside){
						flipper(true);
					}
				} else {
					deg = Math.floor(((x - 480) / 3));
					flipangle = deg;
//						console.log(deg);
					$("#card").css({ '-webkit-transform': 'rotateY( ' + deg + 'deg )', 'transform': 'rotateY( ' + deg + 'deg )' });
				}
			}
//			if(flipside){
//			}
			flipblock = true;
			flipblockIvl = setTimeout(function () { flipblock = false },150);
		}				
	});
}

function trackoff () {
//	console.log('trackoff');
	$(document).unbind('mousemove');
}

function flipper (isright){
//	console.log('flipper ' + isright + ' ' + flipside);
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

function scrubberUpdater (intime){
	var dur = Math.floor(document.getElementById("video1").currentTime);
	if(dur > 0){
		var ratio = (document.getElementById("video1").duration / dur);
	}
	$("#progress").css({ "width": (930 / ratio) + 'px' })
}

function playDecide(){
	document.getElementById("video2").volume = 0;
	if(vid1Loaded && vid2Loaded){
		playVids();
		playState = 1;
	}
}

function playButton(){
//	console.log('playbutton');
	if(playState == 1){
		pauseVids();
	}
	else if(playState == 2){
		playVids();
		playState = 1;
	}
	else{
		document.getElementById("video1").currentTime = 0;
		document.getElementById("video2").currentTime = 0;
		playVids();
		playState = 1;				
	}
}

function playVids(){
	if(audioactive){
		audiostop();
	}
	document.getElementById("video1").play();
	document.getElementById("video2").play();
	document.getElementById("video2").volume = 0;
}

function pauseVids(){
	document.getElementById("video1").pause();
	document.getElementById("video2").pause();
	playState = 2;
}

function endVids(){
//			$("#instructions1").fadeIn('slow');
	playState = 3;
}


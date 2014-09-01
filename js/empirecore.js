// core routines for empire
//var ripplemode = true;
//var current_ripple = 0;
var audioactive = false;
var audiovolume = 20;
var _currentaudiovolume = 0;
var ambientAudio;
var vIvl;
var dontannoysam = false;
var _ammobile = false;
var _canhls = true;
var paper;
var resizing = false;
var total = 4;
var w, h, paperHeight, paperWidth, container, canvasContainer, containerInner, navigation;
var config = {
	titleOffset:90,
	animationSpeed:1000,
	titleHeight:30,
	bigRadiusOffset: 60,
	bigRadHeightShift: 200,
	smCradleRadius: 100,
	smRadiusOffset: 70,
	bottomLetterOffset: 28,
	rippleGrowSpeed: 600,
	heightMultiplier: 0.20,
	titleFadeSpeed: 500,
	// theta: 40.10359804
	theta: 39
};

var firstTimeLoadMigrants = false;
var menu = [];
var RIPPLE_ID = ['ripple_c', 'ripple_l', 'ripple_m', 'ripple_p'];
var LABELS = ['Cradle','Legacy','Migrants', 'Periphery'];
var LETTERS = ['C', 'L', 'M', 'P'];
var COLORS = ['#ecda50', '#fbb03b', '#ff5a00', '#cc3333'];
var URL = ['url(art/c_bg.jpg)', 'url(art/l_bg.jpg)', 'url(art/m_bg.jpg)', 'url(art/p_bg.jpg)' ];
// var URL_BOTTOM = ['url(art/c_bg_b.jpg)', 'url(art/l_bg_b.jpg)', 'url(art/m_bg_b.jpg)', 'url(art/p_bg_b.jpg)' ];
var m_url = 'migrants/css/timecode.json';
// var m_url = 'http://empire.genevievehoffman.com/migrants/css/timecode.json';
var hidden, visibilityChange; 


$(document).ready(function () {

	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    // var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    if (!isChrome) {
    	$('body:first').append('<div id="browserno"><div class="padded">Sorry, this experiment is only currently working in Google Chrome. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
    	$("#browserno").slideDown();
    	// console.log("BROWSER NOT CHROME");
    }

	//load ambient audio
	if(window.location.href.indexOf("noaudio") != -1) {  //what does this do?
		dontannoysam = true;
	}

	if(!dontannoysam) {
		document.getElementById('ambientaudio').addEventListener('canplaythrough', audioready);
	}

	$("#loading_content").delay(4000).fadeOut(1000, function() {
		$("#loading_screen").fadeOut(1000);

	});
	// setTimeout(10000,fadeLoading);
	//console.log("Im in ready ");
	ambientAudio = document.getElementById('ambientaudio');
	container = $("#container");
	canvasContainer = $("canvas_container");
	containerInner = $("#containerinner");
	navigation = $("#navigation");
	paperWidth = container.width();
	paperHeight = container.height();
	paper = ScaleRaphael('canvas_container', paperWidth, paperHeight);
	//console.log('paperWidth: '+paperWidth+', paperHeight: '+paperHeight);
	w = paper.w;
	h = paper.h;
	//console.log('w: '+w+', h: '+h);
	paper.canvas.setAttribute('preserveAspectRatio', 'none');

	buildRipples(total); //creates four ripples

	canvasContainer.fadeIn(2000);
	containerInner.fadeIn(2000);

	drawer();

	//migrantsVideo = document.getElementById("migrants_video");

	legacy.init();
	cradle.init();
	periphery.init();
	migrants.init();
	//loadMedia();
	// addPeripheryListeners();
	// addMigrantsListeners();

	// attachMigrantsEvents();
	// attachPeripheryEvents();
	window.addEventListener("hashchange", hashEvent, false);

	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
		hidden = "mozHidden";
		visibilityChange = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}

	document.addEventListener("visibilitychange", handleVisibilityChange, false);

	$(".home_button").on('click', function(e) {
		cradle.deactivate();
		periphery.deactivate();
		legacy.deactivate();
		migrants.deactivate();
		// var p_target = document.getElementById("target");
		// var l_sriVid = document.getElementById("srilanka_leg");
		// var l_saVid = document.getElementById("southafrica_leg");
		// var l_indoVid = document.getElementById("indonesia_leg");
		// var l_indiaVid = document.getElementById("india_leg");

			//console.log("[document ready] home_button : p_pauseVids ? " + peripheryActive);
		if (!document.getElementById("migrants_video").paused) {
			m_pauseVids();
		}
		//console.log("[ document ready ] home button : animateHome()");
		animateHome();
		window.location.hash = "";
		history.pushState('', document.title, window.location.pathname); // nice and clean
    	e.preventDefault();
	});

	$(document).on('keydown',function (e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		if (key == 32){
	   		e.preventDefault();
			// if(cradle.active()) {
			// 	cradle.playButton();
			// }
			// else if(periphery.active()) {
			// 	// crad
			// }
		}

		else if (key == 68 || key == 100) { //press 'D' or 'd'
			e.preventDefault();
			legacy.buildEndScreen();
			console.log("legacy endscreen");
		}

		else if (key == 67 || key == 99) { //press 'C' or 'c'
			// cradle.endVideos();
		}

		else if (key == 69 || key == 101) { // press 'E' or 'e'
			m_audioToggle();
		}

		else if (key == 70 || key == 102 ) { // press 'F' or 'f'
			downloadMigrants = true;
			console.log("You Can Now Download Migrants");
		}

		else if (key == 71 || key == 103 ) { // press 'G' or 'g'
			downloadMigrants = false;
			returnMigrants = true;
			console.log("Returning to Migrants Cycle");
		}
	});

	resizePaper();

	$(window).resize( function() {

		resizePaper();

		drawer();

		if(cradle.active()){
			cradle.sizer();
		}
		else if (periphery.active()) {
			periphery.sizer();
		}
		else if(migrants.active()) {
			migrants.resize();
		}
		else{
			legacy.sizer();
		}


	});

	var path = window.location.hash;

	//console.log(path);
	// console.log(loc[loc.length -1])
	if (path == "#cradle" ) {
		animateButton(0);
	} else if (path == "#legacy") {
		animateButton(1);
	} else if (path == "#migrants") {
		animateButton(2);
	} else if (path == "#periphery") {
		animateButton(3);
	}

});

function buildRippleNode(index){
	var ripple, pattern, title, bottomLetter, topLetter;
	//var offset = 180; //used to be a set opening radius
	var offset = w * 0.11; //multiplier that works with my aspect ratio
	var pos = (offset * index) + offset; //radius of Home Button
	//var titleOffset = config.titleOffset;
	var titleOffset = offset/2;
	var titleHeight = config.titleHeight;
	// var titleHeight = offset/4;
	//console.log("titleHeight: "+titleHeight);
	var aspectRatio = h/w;
	//topLetter variables
	var smCradleR = config.smCradleRadius;
	var smRadiusOffset = config.smRadiusOffset;
	var topLetX = smCradleR/2 + (smRadiusOffset * index);

	//bottomLetter variables
	var bigRadiusOffset = config.bigRadiusOffset;
	var posX = w + (0.036 * w * index);
	var posY = (posX * aspectRatio);
	posY += posY*0.5;
	var bottomLetterOffset = config.bottomLetterOffset;
	var theta = config.theta;
	var rad = Math.PI/180;

	var posY_ = w * aspectRatio;
	posY_ += posY_*0.5;
	var thetaY = theta;
	var botLetX =  (posX) * Math.cos((theta) * rad) + (bottomLetterOffset * index) - (bottomLetterOffset*1.3);
	var botLetY =  posY_ * Math.sin(thetaY * rad);

	ripple = paper.path("M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z")
	ripple.attr({'fill': COLORS[index], 'fill': URL[index], 'stroke': COLORS[index], 'cursor': 'pointer', 'position':'absolute'})
		  .data('name_', RIPPLE_ID[index]);

	title = paper.text(pos - titleOffset, titleHeight, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1, 'cursor': 'pointer'});
	topLetter = paper.text(topLetX, titleHeight, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0, 'cursor': 'pointer'});
	bottomLetter = paper.text(botLetX, botLetY, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0, 'cursor': 'pointer'});

	//for debugging bottom letter placement
	// for(var i=0; i< 360; i++){
	// 	botLetX =  posX * Math.cos(i * rad);
	// 	botLetY =  posY * Math.sin(i * rad);
	// 	paper.text(botLetX, botLetY, i).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0.2});
	// }
    var btn = new Button(ripple, title, topLetter, bottomLetter, false, false);
    btn.id = RIPPLE_ID[index];
    btn.index = index;

    //TODO: how do i set isActive and isBig to be false at initialization?
    //console log says they are "undefined"

    btn.onClick();
    return btn;
}

function Button(ripple, title, topLetter, bottomLetter, isActive, isBig) {
	this.ripple = ripple;
	//this.image = image;
	this.title = title;
	this.topLetter = topLetter;
	this.bottomLetter = bottomLetter;
	this.isActive = isActive;
	this.isBig = isBig;
}

Button.prototype.onClick = function(){
	//console.log('hola ', this.title);
};

Button.prototype.addClickListener = function(callback){
	//magic function for button click listeners
	this.ripple.click($.proxy(callback, this));
	this.title.click($.proxy(callback, this));
	this.topLetter.click($.proxy(callback, this));
	this.bottomLetter.click($.proxy(callback, this));
};

function resizePaper( ){
    resizing = true;
    clearTimeout(this.id);
    this.id = setTimeout(function(){
    	var win = $(this);
   		paper.changeSize(win.width(), win.height(), false, false);
   		resizing = false;
    }, 500);
}

function buildRipples(total) {

	//var button = new Button();
	var button;

	for(var index = total-1; index >= 0; index--)
	{
		//console.log("In build ripples button");
		button = buildRippleNode(index);
		menu.unshift(button);
		button.addClickListener(function() {
			//call animate function on click
			animateButton(this.index);
		});
	}
}

function hashEvent(){
	//console.log(window.location.hash)
}
function animateButton(index){

	//interactivity for ripple navigation
	//console.log(' [ animateButton ]', index);

		for(var i = 0; i < menu.length; i++ ) {
			// if(index !== i){
				//set all the other ripples to not active / not big
				menu[i].ripple.isActive = false;
				menu[i].ripple.isBig = false;
				menu[i].ripple.attr({'cursor' : 'pointer'});
			// }
		}
		//set this ripple to active

 		growRippleNode(index);

		if(index === 0) {
			//console.log("[ animateButton ] cradle was loaded  ?" + cradleLoaded);
			location.hash = "cradle";
			cradle.activate();
			audioready();
		 }
		 else {
		 	cradle.deactivate();
		 }

		 if(index === 1) {
			location.hash = "legacy";
		 	legacy.activate();
		 	audioready();
		 } else {
			legacy.deactivate();
		}

		if(index === 2) {
			location.hash = "migrants";
			migrants.activate();
		 	audioready();
		 }
		 else{
			migrants.deactivate();
		 }

	 	if(index === 3) {
	 		location.hash = "periphery";
	 		periphery.activate();
		 	audioready();
 		} else {
 			periphery.deactivate();
		}
			navigation.fadeIn();
	 		containerInner.fadeOut(function() {
	 	});

		menu[index].ripple.attr({'cursor' : 'default'});

		fadeTitles(0);

}


function growRipples() {

}

function growRippleNode(index) {
	var speed = config.rippleGrowSpeed;
	var bigRadiusOffset = config.bigRadiusOffset;
	var aspectRatio = h/w;

	for(var i = index; i < menu.length; i++) {
		fadeTopLetters(i, 0);
		var ripple = menu[i].ripple;

		var posX = w + (0.036*w * i);

		var posY = (posX * aspectRatio);
		posY += posY*0.5;

		ripple.animate({path: "M0,0 L" + posX +",0 A" + posX +"," + posY + " 0 0,1 0," + posY + "z"}, speed,
		function() {

			for(var i = index; i < menu.length; i++) {

				var _index = i+1;
				if( i === menu.length-1) {
					continue;
				}
				fadeBottomLetters( _index, 1);
			}
		});
	}

	for(var i = 0; i < index; i++) {
		shrinkRippleNode(i);
	}
}

function shrinkRippleNode(index) {
	var speed = config.rippleGrowSpeed;
	var smCradleR = config.smCradleRadius;
	var smRadiusOffset = config.smRadiusOffset;

	for(var i = 0; i <= index; i++) {

		var _index = i + 1;

		if(index === menu.length - 1) {
			 continue;
		}

		fadeBottomLetters( _index, 0);

		var ripple = menu[i].ripple;
		var pos = smCradleR + (smRadiusOffset * i);
			ripple.attr({'cursor' : 'pointer'});
		ripple.animate({path: "M0,0 L" + pos +",0 A" + pos +"," + pos + " 0 0,1 0," + pos + "z"}, speed,
		function() {

			  for(var i = 0; i <= index; i++) {
				fadeTopLetters( i, 1);
			 }
		});
	}
}

function animateHome() {
	for( var i = 0; i < menu.length; i++) {
		animateHomeNode(i);
	}
	audioready();
	legacy.deactivate();
	cradle.deactivate();
	migrants.deactivate();
	periphery.deactivate();

}

function animateHomeNode(index) {
	//take ripples back to original state - home page
	var speed = config.rippleGrowSpeed;
	var offset = w * 0.11;
	var pos = (offset * index) + offset; //radius of Home Button
	var titleOffset = config.titleOffset;
	var titleHeight = config.titleHeight;

	for(var i = 0; i < menu.length; i++) {
		//fade out bottom letters, opacity = 0
		fadeBottomLetters(i, 0);
		fadeTopLetters(i, 0);
	}

	var ripple = menu[index].ripple;
	ripple.attr({'cursor' : 'pointer'});
	ripple.animate({path: "M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z"}, speed,
	function() {
		//fade in titles, opacity = 1
		fadeTitles(1);
		navigation.fadeOut();
 		containerInner.fadeIn();

 		migrants.deactivate();
 		cradle.deactivate();
 		legacy.deactivate();
 		periphery.deactivate();


	});
	//set menus to not big, not active
	menu[index].isActive = false;
	menu[index].isBig = false;
}



function p_toggleButtonDisplay() {
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

function fadeTitleNode(index, opacity) {
	var speed = config.titleFadeSpeed;
	var title = menu[index].title;
	title.animate({'opacity': opacity}, speed);
}

function fadeTitles(opacity) {
	for(var i=0; i<menu.length; i++){
		fadeTitleNode(i, opacity);
		//console.log("fade");
	}
}

function fadeBottomLetters(index, opacity) {
	var speed = config.titleFadeSpeed;
	var bottom = menu[index].bottomLetter;
	// console.log(index);
	// console.log(opacity);
	// console.log(bottom);
	bottom.animate({'opacity': opacity}, speed);
}

function fadeTopLetters(index, opacity) {
	var speed = config.titleFadeSpeed;
	var top = menu[index].topLetter;
	top.animate({'opacity': opacity}, speed);
	if(opacity === 0) {
		top.hide();
	} else if (opacity === 1){
		top.show();
	}
}

function drawer () {
	var _w = container.width();
	var _h = container.height();
	var rMargin = 300;
	var rMargin_alt = '10%';

	$("#titleblock").css({ 'right': rMargin_alt, 'top': '8%'});
	$("#pinchelines").css({ 'height': (_h-(86+80)), 'right': rMargin_alt, 'top': 150 });
	$("#preaching").css({ 'right': rMargin_alt, 'top': ( _h - 70) });
	$("#legacy").css({ 'top': ((_h/2) - 280), right: rMargin_alt });
	$("#cradle").css({ 'top': ((_h/2) + 20), right: rMargin_alt });

	$("#bodytext").css( { 'right': rMargin_alt, 'top': '25%' });
	$("#credits").css( { 'right': rMargin_alt, 'top': '60%' });
}

function audioready() {
	// audio has loaded, let's do this
	console.log("ambient audio has loaded and playing");
	//console.log("ambientAudio: " + ambientAudio);
	if(!audioactive){
		ambientAudio.volume = 0;
		ambientAudio.play();
		vIvl = setInterval(fadeInAmbientAudio,100);

		// $("#ambientaudio").fadeaudio({
		// 	'fade_in_start' : ambientAudio.currentTime,
		// 	'fade_in_interval' : 100,
 	// 		'step' : 0.1
		// });

		audioactive = true;
	}
}

function audiostop() {
	console.log("ambient audio is stopping");

	clearInterval(vIvl);
	vIvl = setInterval(fadeOutAmbientAudio,100);

	// $("#ambientaudio").fadeaudio({
	// 	'fade_out_start' : ambientAudio.currentTime,
	// 	'fade_out_interval' : 100
	// });
	audioactive = false;
}

var fadeInAmbientAudio = function () {

	// internal function to fade in
	
	
	if(_currentaudiovolume <= 0 ){
		_currentaudiovolume = 0;
	}
	else if(_currentaudiovolume >= 100){
		_currentaudiovolume = 100;
	}
	else{
		_currentaudiovolume += 3;	
	}
	ambientAudio.volume = _currentaudiovolume / 100;
	
	// console.log("Fade Vol up " + _currentaudiovolume);
	if(_currentaudiovolume > audiovolume){
		clearInterval(vIvl);
	}
};

var fadeOutAmbientAudio = function () {

	// internal function to fade outaudio
	// if(_currentaudiovolume >= 0){
	// 	
	// }
	if(_currentaudiovolume <= 0 ){
		_currentaudiovolume = 0;
	}
	else if(_currentaudiovolume >= 100){
		_currentaudiovolume = 100;
	}
	else{
		_currentaudiovolume -= 1;	
	}
	ambientAudio.volume = _currentaudiovolume / 100;

	// _currentaudiovolume -= 1;
	// console.log("Fade Vol down " + _currentaudiovolume);
	if(_currentaudiovolume == 0){
		clearInterval(vIvl);
		ambientAudio.pause();
	}
}

	//startSimulation and pauseSimulation defined elsewhere
var	handleVisibilityChange = function() {
	if (document.hidden) {
		pauseSiteAudio();	
	} else  {
		playSiteAudio();
	}
}

function pauseSiteAudio() {

	// cradle.pauseVideos();
	// legacy.pauseVideos();
	// migrants.pauseVideos();
	// periphery.pauseVideos();

	if(cradle.active()) {
		cradle.pauseVideos();
		console.log(" cradle pause site audio");
	} else if(legacy.active()) {
		legacy.zoomOut();
		legacy.pauseVideos();
		console.log("legacy pause site audio");
	} else if(migrants.active()) {
		migrants.pauseVideos();
		console.log("migrants pause site audio");
	} else if(periphery.active()) {
		periphery.pauseVideos();
		console.log("periphery pause site audio");
	} 

	if(audioready) {
		//audiostop();
		ambientAudio.volume = 0;
		console.log("ambient pause site audio");
	}
	console.log("pause site audio");
}

function playSiteAudio() {
	console.log("page is visible - playing site audio");
	if(cradle.active()) {
		cradle.toggleButtonDisplay();
		console.log(" cradle play site audio");
	} else if(legacy.active()) {
		legacy.toggleButtonDisplay();
		console.log("legacy play site audio");
	} else if(migrants.active()) {
		migrants.playVideos();
		console.log("migrants play site audio");
	} else if(periphery.active()) {
		periphery.toggleButtonDisplay();
		console.log("periphery play site audio");
	} 

	if(audiostop) {
		//audioready();
		ambientAudio.volume = 0.25;
		console.log("ambient play site audio");
	}

}

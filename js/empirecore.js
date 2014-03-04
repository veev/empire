// core routines for empire
//var ripplemode = true;
//var current_ripple = 0;
var audioactive = false;
var audiovolume = 20;
var _currentaudiovolume = 0;
var vIvl = new Number();
var dontannoysam = false;
var _ammobile = false;
var _canhls = true;
var paper;
var resizing = false;
var total = 4;
var w, h, paperHeight, paperWidth;
var config = {
	titleOffset:90,
	animationSpeed:1000,
	titleHeight:40,
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

var cradleLoaded = false;
var legacyLoaded = false;
var migrantsLoaded = false;
var peripheryLoaded = false;
var cradleActive = false;
var legacyActive = false;
var migrantsActive = false;
var peripheryActive = false;
var menu = [];
var RIPPLE_ID = ['ripple_c', 'ripple_l', 'ripple_m', 'ripple_p'];
var LABELS = ['Cradle','Legacy','Migrants', 'Periphery'];
var LETTERS = ['C', 'L', 'M', 'P'];
var COLORS = ['#ecda50', '#fbb03b', '#ff5a00', '#cc3333'];
var URL = ['url(art/c_bg.jpg)', 'url(art/l_bg.jpg)', 'url(art/m_bg.jpg)', 'url(art/p_bg.jpg)' ];
var URL_BOTTOM = ['url(art/c_bg_b.jpg)', 'url(art/l_bg_b.jpg)', 'url(art/m_bg_b.jpg)', 'url(art/p_bg_b.jpg)' ];


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
		//$('body:first').append('<div id="audiodiv" style="display: none"><audio src="https://s3-us-west-2.amazonaws.com/empire-project/ambiance.mp3" type="audio/mpeg" loop id="ambientaudio"></audio></div>');
		document.getElementById('ambientaudio').addEventListener('canplaythrough', audioready);
	}

	//console.log("Im in ready ");
	paperWidth = $('#container').width();
	paperHeight = $('#container').height();
	paper = ScaleRaphael('canvas_container', paperWidth, paperHeight);
	//console.log('paperWidth: '+paperWidth+', paperHeight: '+paperHeight);
	w = paper.w;
	h = paper.h;
	console.log('w: '+w+', h: '+h);
	paper.canvas.setAttribute('preserveAspectRatio', 'none'); 

	buildRipples(total); //creates four ripples

	drawer();
	$("#containerinner").fadeIn();

	//loadMedia();
	addCradleListeners();
	addPeripheryListeners();

	attachCradleEvents();
	attachLegacyEvents();
	attachMigrantsEvents();
	attachPeripheryEvents();

	$(".home_button").on('click', function() {
		if(cradleActive) {
			c_pauseVids();
			document.getElementById("video1").currentTime = 0;
			document.getElementById("video2").currentTime = 0;
			//console.log("[document ready] home_button : c_pauseVids ? " + cradleActive);
		}
		else if (peripheryActive) {
			p_pauseVids();
			document.getElementById("target").currentTime = 0;
			document.getElementById("audio_norm").currentTime = 0;
			document.getElementById("audio_yeti").currentTime = 0;
			//console.log("[document ready] home_button : p_pauseVids ? " + peripheryActive);

		}


		//console.log("[ document ready ] home button : animateHome()");
		animateHome();
	});

	$(document).on('keydown',function (e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		if (key == 32){
	   		e.preventDefault();

			if(cradleActive) {
				//console.log('[ document on keydown ] : c_playButton');
				c_playButton();	
			}

			else if(peripheryActive) {
				//console.log('[ document on keydown ] : p_playButton');
				p_playButton();
				
			}

			else {
				//console.log(' [ document on keydown ] : nothing active');
			}
		}

		else if (key == 68 || key == 100) {
			e.preventDefault();
			p_endVids();
			//console.log(' [ document on keydown ] : debug p_endVids p_buildscreen');
		}

		else if (key == 67 || key == 99) {
			c_endVids();

		}
	});

	resizePaper();

	$(window).resize( function() {

		resizePaper();

		drawer();

		if(cradleActive) {
			cradle_sizer();
			lazywidth = $("#c_outerouter").width();
			var c_marginsize = (lazywidth - 960) / 2;
			c_leftpoint = c_marginsize + 180;
			c_rightpoint = (lazywidth - c_marginsize) - 180;
		}
		else if (peripheryActive) {
			periphery_sizer();
			p_lazywidth = $("#p_outerouter").width();
			var p_marginsize = (p_lazywidth - 960) / 2;
			p_leftpoint = p_marginsize + 180;
			p_rightpoint = (p_lazywidth - p_marginsize) - 180;
		}
		else if(legacyActive) {
			legacy_sizer();
		}
		else if(migrantsActive) {
			migrants_sizer();
		}

	});

//how do i get scroll snap to work better?

	// if(cradleActive) {
		//console.log("[ document ready ] cradleActive scrollsnap");
		$(document).scrollsnap({
			snaps: '.snap',
			proximity: 200,
			onSnapEvent: cradle_scrollsnaphandle
		});
	// } 
	// else if (peripheryActive) {
	// 	console.log("[ document ready ] peripheryActive scrollsnap");
	// 	$(document).scrollsnap({
	// 		snaps: '.snap',
	// 		proximity: 180,
	// 		handler: periphery_scrollsnaphandle
	// 	});
	// }


});

// $(window).bind("scroll", function() {
// 	//testing viewport
// 	// var viewPortTest = $("div").withinViewportBottom();
// 	// console.log(viewPortTest);

// 	// var videoElem = document.getElementById("video1");
// 	// if(cradleActive && !peripheryActive) {
// 	// 	if($("#c_container").is(":within-viewport-bottom")) {
// 	// 		console.log("[ window scroll ] c_container within-viewport-bottom");
// 	// 		cradle_openscreen();
// 	// 	}
// 	// } else 
// 	if (peripheryActive ) {
// 		if($("#p_instructions").is("within-viewport-bottom")) {
// 			console.log("[ window scroll ] p_container within-viewport-bottom");
// 			periphery_openscreen();
// 		}
// 	}

// });

function buildRippleNode(index){
	var ripple, pattern, title, bottomLetter, topLetter;
	//var offset = 180; //used to be a set opening radius
	var offset = w * 0.11; //multiplier that works with my aspect ratio
	var pos = (offset * index) + offset; //radius of Home Button
	//var titleOffset = config.titleOffset;
	var titleOffset = offset/2;
	var titleHeight = config.titleHeight;
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
	ripple.attr({'fill': COLORS[index], 'fill': URL[index], 'stroke': COLORS[index], 'cursor': 'pointer', 'overflow':'hidden'})
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

function cradle_scrollsnaphandle(e){
	console.log(e)
	console.log("im here")
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
			
			$("#cradleContent").fadeIn(2000);
			
			if(cradleLoaded === false) {

			 	loadCradle2();
				
			 	cradleLoaded = true;
				//console.log("[ animateButton ] cradle was loaded  ?" + cradleLoaded);
			 }
			
			//console.log("[ document ready ] cradleActive scrollsnap");
			$(document).scrollsnap({
				snaps: '.snap',
				proximity: 180,
				handler: cradle_scrollsnaphandle
			});		 
			
			 //addCradleListeners();
			cradleActive = true;
			audioready();
			if( document.getElementById("video1") == null ){
				//console.log("wtf? cradle") 
			}
			else{
				if( document.getElementById("video1").currentTime > 0 ) {
				 	//console.log("toggling display");
				 		c_toggleButtonDisplay();
				 }
				 //console.log("video1 current time  ?" + document.getElementById("video1").currentTime);	 	
				
			}
			//console.log("[ animateButton ] cradle is active  ?" + cradleActive);

		 } else {

		 	$("#cradleContent").fadeOut("fast");
		 	c_pauseVids();
		 	cradleActive = false;
		 	//console.log("[ animateButton ] cradle is active  ?" + cradleActive);

		 }

		 if(index === 1) {

		 	//console.log("[ animateButton ] legacy was loaded ?" + legacyLoaded);

		 	$("#legacyContent").fadeIn(2000);

		 	if(legacyLoaded === false){
		 	 	loadLegacy();	
		 	 	legacyLoaded = true;
		 	 	//console.log("[ animateButton ] legacy was loaded  ?" + legacyLoaded);
		 	 	
		 	}	
		 	legacyActive = true;
		 	audioready();
		 	//console.log("[ animateButton ] legacy is active  ?" + legacyActive);
		 } 
		 else  {

		 	$("#legacyContent").fadeOut("fast");
		 	legacyActive = false;
		 	//console.log("[ animateButton ] legacy is active  ?" + legacyActive);
		 }

		  if(index === 2) {

		 	//console.log("[ animateButton ] migrants was loaded ?" + migrantsLoaded);

		 	$("#migrantsContent").fadeIn(2000);

		 	if(migrantsLoaded === false){
		 	 	
		 	 	loadMigrants();	
		 	 	migrantsLoaded = true;
		 	 	//console.log("[ animateButton ] migrants was loaded  ?" + migrantsLoaded);
		 	 	
		 	}	
		 	migrantsActive = true;
		 	audioready();
		 	//console.log("[ animateButton ] migrants is active  ?" + migrantsActive);
		 } 
		 else  {

		 	$("#migrantsContent").fadeOut("fast");
		 	migrantsActive = false;
		 	//console.log("[ animateButton ] migrants is active  ?" + migrantsActive);
		 }

	 	if(index === 3) {
	 		//console.log("[ animateButton ] periphery was loaded  ?" + peripheryLoaded);

			$("#peripheryContent").fadeIn(2000);
		 	if(peripheryLoaded === false) {

		 		loadPeriphery2();
		 		peripheryLoaded = true;
		 		//console.log("[ animateButton ] periphery was loaded  ?" + peripheryLoaded);

		 	}
		 	peripheryActive = true;
		 	audioready();

		 	if( document.getElementById("target") == null ){
				//console.log("wtf? periphery") 
			}
			else{
				if( document.getElementById("target").currentTime > 0 ) {
				 	//console.log("toggling periphery display");
				 	p_toggleButtonDisplay();
				 }
				 //console.log("target current time  ? " + document.getElementById("target").currentTime);	 	
				
			}
		 	//console.log("[ animateButton ] periphery is active  ?" + peripheryActive);
 	
 		} else {

		 	$("#peripheryContent").fadeOut("fast");
		 	p_pauseVids();
		 	peripheryActive = false;
		 	//console.log("[ animateButton ] periphery is active  ?" + peripheryActive);
		} 			
			$("#navigation").fadeIn();
	 		$("#containerinner").fadeOut(function() {
	 			//console.log("faded out containerinner");
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

	$("#cradleContent").fadeOut();
	$("#legacyContent").fadeOut();
	$("#migrantsContent").fadeOut();
	$("#peripheryContent").fadeOut();
	
	for( var i = 0; i < menu.length; i++) {
		animateHomeNode(i);
	}

	//audioactive = false;
	//console.log("[ animateHome ] : audioready");
	audioready();
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
		$("#navigation").fadeOut();
 		$("#containerinner").fadeIn();
 		//console.log("In animate home");
 		cradleActive = false;
 		peripheryActive = false;
 		cradleLoaded = false;
 		peripheryLoaded = false;
 		migrantsLoaded = false;
 		migrantsActive = false;
 		legacyLoaded = false;
 		legacyActive = false;
 		//console.log("[ animateHomeNode ] cradleActive ? "+ cradleActive +", peripheryActive ?" + peripheryActive);
 		//console.log("[ animateHomeNode ] cradleLoaded ? "+ cradleLoaded +", peripheryLoaded ?" + peripheryLoaded);

	});
	//set menus to not big, not active
	menu[index].isActive = false;
	menu[index].isBig = false;
}

function loadMigrants() {

	$("#migrantsContent").css({ 'width' : '100%', 'height' : '100%' });
	$(".migrants_top").css({ 'background' : 'none'});

	migrants_sizer();
}

function loadLegacy() {
	$("#legacyContent").css({ 'width' : '100%', 'height' : '100%' });
	$(".legacy_top").css({ 'background' : 'none' });

	legacy_sizer();
}

function loadCradle2() {

	//console.log("[ loadCradle2 ]");

	$("#cradleContent").css({'width': '100%', 'height': '100%'});
   	$(".cradle_top").css({'background': 'none'});

	cradle_sizer();

	lazywidth = $("#c_outerouter").width();
	
	c_currentvideoid = 'video1';

	c_enablecontrols();

	//console.log("[ loadCradle2 ] mouseXTracking = " + mouseXTracking);

	//attachCradleEvents();

	//console.log("[ loadCradle 2 ] cradle_openscreen()");
	//cradle_openscreen();
}

function c_toggleButtonDisplay(){

	if(document.getElementById("video1") != null){
		if(document.getElementById("video1").paused ){
			// c_playVids();	
			//console.log("Toggle cradle play button on");
			$("#c_play_bg").fadeIn();
		}
		else{
			$("#c_play_bg").fadeOut();	
			//console.log("Toggle cradle play button off");			
		}
	}
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

function attachCradleEvents() {
	//console.log("[ Cradle Events ] Attach Cradle Events")

	$("#c_playElement").on('click', function () {
		//console.log("[Attach Cradle Events: c_playElement ] c_playButton");
		c_playButton();
		if( !document.getElementById("video1").paused ){
			c_toggleButtonDisplay();	
		}
		// toggleButtonDisplay();

	}).on('mouseover', function (){
		if(document.getElementById("video1").paused || document.getElementById("video2").paused){
			$("#c_playElement").css({'background':'url(../art/cradle/playWhite.png)'})
		} else {				
			$("#c_playElement").css({'background':'url(../art/cradle/pauseWhite.png)'})
		}
	}).on('mouseout', function (){
		if(document.getElementById("video1").paused || document.getElementById("video2").paused){
			$("#c_playElement").css({'background':'url(../art/cradle/playYellow.png)'})
		} else {				
			$("#c_playElement").css({'background':'url(../art/cradle/pauseYellow.png)'})
		}
	});

	$("#c_refresh").on('click', function() {
		c_restartVids();
	}).on('mouseover', function() {
		$("#c_refresh").css({'background':'url(../art/cradle/refresh_white.png'});
			//console.log("mouseing over refresh");
	}).on('mouseout', function() {
		$("#c_refresh").css({'background':'url(../art/cradle/refresh_yellow.png'});
	});

	$("#c_play_bg").on('click', function() {
		//console.log("[Attach Cradle Events: c_play_bg ] c_playButton");
		c_playButton();
		c_toggleButtonDisplay();
	});
	// //testing viewport
	// var viewPortTest = $("div").withinViewportTop();
	// console.log(viewPortTest);

	// // var videoElem = document.getElementById("video1");
	// if($("#c_container").is(":within-viewport-bottom")) {
	// 	console.log("[ attachCradleEvents ] c_container within-viewport-top");
	// 	cradle_openscreen();
	// }

	$("#legacy_cbutton").on('click', function() {
		//console.log("[ attach Cradle Events ] legacy_cbutton - c_pauseVids");
		c_pauseVids();
		$('html body').animate({ scrollTop: ($('#cradle_top').offset().top) }, 1000, function() {
			animateButton(1);
		}); 
	});

	$("#migrants_cbutton").on('click', function() {
		//console.log("[ attach Cradle Events ] migrants_cbutton - c_pauseVids");
		c_pauseVids();
		$('html body').animate({ scrollTop: ($('#cradle_top').offset().top) }, 1000, function() {
			animateButton(2);
		});
	});

	$("#periphery_cbutton").on('click', function() {
		//console.log("[ attach Cradle Events ] periphery_cbutton - c_pauseVids");
		c_pauseVids();
		$('html body').animate({ scrollTop: ($('#cradle_top').offset().top) }, 1000,function(){
	 		animateButton(3);
		});
	});
}

function attachMigrantsEvents() {
	$("#cradle_mbutton").on('click', function() {
		$('html body').animate({ scrollTop: ($('#migrants_top').offset().top) }, 1000, function() {
			animateButton(0);
		});
	});

	$("#legacy_mbutton").on('click', function() {
		$('html body').animate({ scrollTop: ($('#migrants_top').offset().top) }, 1000, function() {
			animateButton(1);
		});
	});

	$("#periphery_mbutton").on('click', function() {
		$('html body').animate({ scrollTop: ($('#migrants_top').offset().top) }, 1000, function() {
			animateButton(3);
		});
	});
}

function attachLegacyEvents() {

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
}

function loadPeriphery2() {

	$("#peripheryContent").css({'width': '100%', 'height': '100%'});
    $(".periphery_top").css({'background': 'none'});
	periphery_sizer();

	lazyYtop = $("#periphery_top").height();
	lazyHeight = $("#p_outerouter").height();
	lazyYbottom = lazyYtop + lazyHeight;
	// console.log("lazyHeight: " + lazyHeight);
	// console.log("lazyYtop: "+ lazyYtop);
	// console.log("lazyYbottom: "+ lazyYbottom);
	//console.log("Im in ready ");
	w = $("#container").width();
	h = $("#container").height();

	p_currentvideoid = 'target';
	
	p_enablecontrols();

	//console.log("[ loadPeriphery2 ] mouseYTracking = " + mouseYTracking);

	// console.log("LOADING PERIPHERY");
}

function attachPeripheryEvents() {
	//console.log("[ Periphery Events ] Attach Periphery Events");

	$("#p_playElement").on('click', function () {
		//console.log("[Attach Periphery Events: p_playElement ] p_playButton");
		p_playButton();
		if( !document.getElementById("target").paused ){
			p_toggleButtonDisplay();	
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
		p_playButton();
		p_toggleButtonDisplay();
	});

	$("#p_refresh").on('click', function() {
		p_restartVids();
	});

  	$("#cradle_pbutton").on('click', function() {
  		//console.log("[ attach Periphery Events ] cradle_pbutton - p_pauseVids");
  		p_pauseVids();

  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000,function() {
  			animateButton(0);
  		});
  	});

  	$("#legacy_pbutton").on('click', function() {
  		//console.log("[ attach Periphery Events ] legacy_pbutton - p_pauseVids");
  		p_pauseVids();
  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000, function() {
  			animateButton(1);
  		});
  	});

  	$("#migrants_pbutton").on('click', function() {
  		//console.log("[ attach Periphery Events ] migrants_pbutton - p_pauseVids");
  		p_pauseVids();
  		$('html body').animate({ scrollTop: ($('#periphery_top').offset().top) }, 1000, function() {
  			animateButton(2);
  		});
  	});
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
	var _w = $("#container").width();
	var _h = $("#container").height();
	var rMargin = 300;
	var rMargin_alt = 100;

	$("#titleblock").css({ 'right': rMargin_alt, 'top': (86)});
	$("#pinchelines").css({ 'height': (_h-(86+80)), 'right': rMargin_alt, 'top': 150 });
	$("#preaching").css({ 'right': rMargin_alt, 'top': ( _h - 70) });
	$("#legacy").css({ 'top': ((_h/2) - 280), right: rMargin_alt });
	$("#cradle").css({ 'top': ((_h/2) + 20), right: rMargin_alt });

	$("#bodytext").css( { 'right': rMargin_alt, 'top': 220 });
}

function audioready () {
	// audio has loaded, let's do this

	if(!audioactive){
		document.getElementById('ambientaudio').volume = 0;
		document.getElementById('ambientaudio').play();
		vIvl = setInterval(_volfade,100);
		audioactive = true;
	}
	
}

function _volfade () {

	// internal function to fade in

	document.getElementById('ambientaudio').volume = _currentaudiovolume / 100;
	_currentaudiovolume += 5;
	if(_currentaudiovolume > audiovolume){
		clearInterval(vIvl);
	}
}

function _volfadeout () {

	// internal function to fade out

	document.getElementById('ambientaudio').volume = _currentaudiovolume / 100;
	_currentaudiovolume -= 1;
	if(_currentaudiovolume == 0){
		clearInterval(vIvl);
		document.getElementById('ambientaudio').pause();
	}
}

function audiostop () {
	clearInterval(vIvl);
	vIvl = setInterval(_volfadeout,100);
	audioactive = false;	
}



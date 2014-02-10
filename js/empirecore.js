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
var total = 4;
var w, h;
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
var peripheryLoaded = false;
var menu = [];
var RIPPLE_ID = ['ripple_c', 'ripple_l', 'ripple_m', 'ripple_p'];
var LABELS = ['Cradle','Legacy','Migrants', 'Periphery'];
var LETTERS = ['C', 'L', 'M', 'P'];
var COLORS = ['#ecda50', '#fbb03b', '#ff5a00', '#cc3333'];
var URL = ['url(art/c_bg.jpg)', 'url(art/l_bg.jpg)', 'url(art/m_bg.jpg)', 'url(art/p_bg.jpg)' ];
var URL_BOTTOM = ['url(art/c_bg_b.jpg)', 'url(art/l_bg_b.jpg)', 'url(art/m_bg_b.jpg)', 'url(art/p_bg_b.jpg)' ];


$(document).ready(function () {

	if(cradleLoaded){
		cradleLoaded = false;	

	} else if (legacyLoaded) {
		legacyLoaded = false;

	} else if (peripheryLoaded) {
		peripheryLoaded = false;

	}

	else{

	//console.log("Im in ready ");
	w = $("#container").width();
	h = $("#container").height();
	paper = ScaleRaphael('canvas_container', w, h);
	// paper.setViewBox(0, 0, w, h, true);
	// paper.canvas.setAttribute('preserveAspectRatio', 'none'); 

	buildRipples(total); //creates four ripples

	drawer();
	$("#containerinner").fadeIn();

	// var navVisible = $( "#navigation" ).is( ":visible" );

	// if (navVisible) {
	// 	$("#home_button")
	// }

	//if $("navigation" :visible)
	var home = document.getElementById("home_button");
	$("#home_button").on('click', function() {
		//console.log("go home");
		animateHome();
	});
 }

 //   	$(document).on('click', function (e) {
   		
 // 			//console.log('playElement');
 // 			console.log(e);
	// 		//playButton();
	// });


});

$(window).resize(drawer);
// $(window).resize(function() {
// 	w = 
// });


function buildRippleNode(index){
	var ripple, title, bottomLetter, topLetter;
	var offset = 180;
	var pos = (offset * index) + offset; //radius of Home Button
	var titleOffset = config.titleOffset;
	var titleHeight = config.titleHeight;
	var aspectRatio = h/w;
	//topLetter variables
	var smCradleR = config.smCradleRadius;
	var smRadiusOffset = config.smRadiusOffset;
	var topLetX = smCradleR/2 + (smRadiusOffset * index);

	//bottomLetter variables
	var bigRadiusOffset = config.bigRadiusOffset;
	//var posX = w + (bigRadiusOffset * index);
	var posX = w + (0.036 * w * index);
	//var posY = posX - config.bigRadHeightShift;
	//var posY = posX * (0.8154762);
	//var posY = posX - 100;
	// var posY = posX   * ((posX - config.heightMultiplier)/ posX);
		// var posY = posX * (0.8154762);
	//var posY = posX * (0.8154762);
	var posY = (posX * aspectRatio);
	posY += posY*0.5;
	var bottomLetterOffset = config.bottomLetterOffset;
	var theta = config.theta;
	var rad = Math.PI/180;
	// var botLetX = (posX * Math.cos(theta*rad)) + (bottomLetterOffset * index);

	//var botLetX =  posX * Math.cos((theta-(index*1.2)) * rad);
	var posY_ = w * aspectRatio;
	posY_ += posY_*0.5;
	var thetaY = theta;
	var botLetX =  (posX) * Math.cos((theta) * rad) + (bottomLetterOffset * index) - (bottomLetterOffset*1.3);
	var botLetY =  posY_ * Math.sin(thetaY * rad);
	
	// botLetX += 80*(index);
	// var botLetX = w* 0.75 +bottomLetterOffset*index ;//+ bottomLetterOffset*0.80*index;

	ripple = paper.path("M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z")
	ripple.attr({'fill': COLORS[index], 'fill': URL[index], 'stroke': COLORS[index]})
		  .data('name_', RIPPLE_ID[index]);
	ripple.patternTmp = ripple.pattern;
	delete ripple.pattern;
	title = paper.text(pos - titleOffset, titleHeight, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	topLetter = paper.text(topLetX, titleHeight, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	bottomLetter = paper.text(botLetX, botLetY, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});

	// for(var i=0; i< 360; i++){
	// 	botLetX =  posX * Math.cos(i * rad);
	// 	botLetY =  posY * Math.sin(i * rad);
	// 	bottomLetter = paper.text(botLetX, botLetY, i).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0.1});
	// }    
    var btn = new Button(ripple, title, topLetter, bottomLetter, false, false);
    btn.id = RIPPLE_ID[index];
    btn.index = index;

    btn.onClick();
    return btn;
    // return {ripple: ripple, title: title, topLetter: topLetter, bottomLetter: bottomLetter};
}

function bottomLetterPlacing() {

}

function Button(ripple, title, topLetter, bottomLetter, isActive, isBig) {
	this.ripple = ripple;
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
};

function buildRipples(total) {	

	//var button = new Button();
	var button;

	for(var index = total-1; index >= 0; index--)
	{
		button = buildRippleNode(index);
		button.addClickListener(function(){
			//call animate function on click
			animateButton(this.index);

		});
		//button.on('click', handleMenu);
		menu.unshift(button);
	}

	for(var i = 0; i < total; i++) {
		//console.log(menu[i].id);
	}
}

function animateButton(index){

//interactivity for ripple navigation
	//console.log('console here', index)

		for(var i = 0; i < menu.length; i++ ) {
			if(index !== i){
				//set all the other ripples to not active / not big
				menu[index].ripple.isActive = false;
				menu[index].ripple.isBig = false;	
			}
		}
		//set this ripple to active	
		menu[index].ripple.isActive = true;
		//console.log("menu[" + index + "] is active = " + menu[index].ripple.isActive);

		if (menu[index].ripple.isActive && !menu[index].ripple.isBig) {
			growRippleNode(index, function() {

				if(index === 0 && !cradleLoaded){
					loadCradle( function() {
						//attachCradleEvents();
						 //$("#cradleContent").fadeIn(1000);
					});
					$("#cradleContent").fadeIn(2000);

				 } else if (index != 0 ) {
				 	cradleLoaded = false;
				 	$("#cradleContent").fadeOut("fast");
				 }

				 // if(index === 1 && !legacyLoaded) {
				 // 	loadLegacy();
				 // 	$("#legacyContent").fadeIn(2000);
				 // } else if (index != 1) {
				 // 	legacyLoaded = false;
				 // 	$("#legacyContent").fadeOut("fast");
				 // }

				 if(index === 3 && !peripheryLoaded) {
				 	loadPeriphery( function() {
				 		//attachPeripheryEvents();
				 	});
				 	$("#peripheryContent").fadeIn(2000);
				 } else if ( index != 3 ) {
				 	peripheryLoaded = false;
				 	$("#peripheryContent").fadeOut("fast");
				 }
			});	 			
			$("#navigation").fadeIn();
	 		$("#containerinner").fadeOut(function() {

	 		});


			//fade out titles (pass in opacity)
			fadeTitles(0);				
			menu[index].ripple.isBig = true;
			//console.log("menu["+index+"] is big = " + menu[index].ripple.isBig);
			menu[index].ripple.isActive = false;
			//console.log("menu["+index+"] is active = " + menu[index].ripple.isActive);

		} else if (!menu[index].ripple.isBig) {
			//console.log("Shrinking menu["+index+"]")
			//shrinkRippleNode(1);
			shrinkRippleNode(index);
		}
}


function growRipples() {

}

function growRippleNode(index, callback) {
	var speed = config.rippleGrowSpeed;
	var bigRadiusOffset = config.bigRadiusOffset;
	var aspectRatio = h/w;
	//console.log('aspectRatio:' + aspectRatio);
	//var newBigRadOffset = bigRadiusOffset/w;

	for(var i = index; i < menu.length; i++) {
		fadeTopLetters(i, 0);
		var ripple = menu[i].ripple;
		var posX = w + (0.036*w * i);
		//var posX = w + (bigRadiusOffset * i);
		//console.log("ratio: " + (bigRadiusOffset/w) );
		//var posY = posX - config.bigRadHeightShift;
		// var posY = posX * ((posX - h + h*config.heightMultiplier)/ posX);
		//var posY = h * (0.8154762); //multiplier is same as ((posX - bigRadHeightShift)/ posX)
		//var posY = posX * (0.8154762);
		var posY = (posX * aspectRatio);
		posY += posY*0.5;
		//console.log("posY: " + posY);
		ripple.animate({path: "M0,0 L" + posX +",0 A" + posX +"," + posY + " 0 0,1 0," + posY + "z"}, speed,
		function() {
			//$(document).trigger("animation.end");
			for(var i = index; i < menu.length; i++) {

				var _index = i+1
				if( i === menu.length-1) {
					continue;
				}

				fadeBottomLetters( _index, 1);

			}
			//console.log("faded bottom letters");

		});
	}

	for(var i = 0; i < index; i++) {
		shrinkRippleNode(i);
	}

	callback();
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
		ripple.animate({path: "M0,0 L" + pos +",0 A" + pos +"," + pos + " 0 0,1 0," + pos + "z"}, speed,
		function() {
			//$(document).trigger("animation.end");
			  for(var i = 0; i <= index; i++) {

			 	// var _index = i + 1;
			 	// if(i === menu.length - 1) {
			 	// 	continue;
			 	// }

				fadeTopLetters( i, 1);	

			 	// fadeBottomLetters( _index, 0);

			 }
		});
	}
}

function animateHome() {
	for( var i = 0; i < menu.length; i++) {
		animateHomeNode(i);
	}
}

function animateHomeNode(index) {
	//take ripples back to original state - home page
	var speed = config.rippleGrowSpeed;
	var offset = 180;
	var pos = (offset * index) + offset; //radius of Home Button
	var titleOffset = config.titleOffset;
	var titleHeight = config.titleHeight;

	for(var i = 0; i < menu.length; i++) {
		//fade out bottom letters, opacity = 0
		fadeBottomLetters(i, 0);	
		fadeTopLetters(i, 0);
	}
	$("#cradleContent").fadeOut();
	$("#legacyContent").fadeOut();
	$("#peripheryContent").fadeOut();
	cradleLoaded = false;
	legacyLoaded = false;
	peripheryLoaded = false;

	var ripple = menu[index].ripple;
	ripple.animate({path: "M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z"}, speed,
	function() {
		//$(document).trigger("animation.end");
		//fade in titles, opacity = 1
		fadeTitles(1);
		$("#navigation").fadeOut();
 		$("#containerinner").fadeIn();
 		//console.log("In animate home");
	});
	//set menus to not big, not active
	menu[index].isActive = false;
	menu[index].isBig = false;
}


var loadCradle = function (callback) {
 
//this works, but doesn't load cradle css
$("#cradleContent").load("/cradle/index.html #cradle_wrapper", function() {
	//console.log("cradle was loaded");
	cradleLoaded = true;
	var cssLink = "/cradle/css/style.css";
	var jsLink = "/cradle/js/cradle.js";
    // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
    //console.log("THis is the css link : " + cssLink);
   //  $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
   // .appendTo("head");
   $.get(cssLink, function(css) {
   		$('<style type="text/css"></style>')
     		.html(css)
      		// .appendTo("head");
        $.getScript(jsLink, function(){
   			//console.log('cradle getScript');
   		    attachCradleEvents();
   		});
	});
   $("#cradleContent").css({'width': '100%', 'height': '100%'});
   $(".cradle_top").css({'background': 'none'});
   //$("#cradleContent").css({'display': 'none'});
  	//$("#cradleContent").fadeIn(1000);

 //   	$("#containerinner").on('click', function (e) {
 //   		if(e.target && e.targetNode)
 // 			//console.log('playElement');
 // 			console.log(e);
	// 		//playButton();
	// });
 
 });

callback();

}

function attachCradleEvents() {
		if(document.getElementById("video1") !== null) {
			//console.log("video1 not null");
			document.getElementById("video1").addEventListener("canplay",function(){
				vid1Loaded = true; 
				//console.log('vid1Loaded = '+ vid1Loaded);
			},false);
			document.getElementById("video1").addEventListener("ended",function(){ 
				endVids();
			},false);
			document.getElementById("video1").addEventListener("timeupdate",function(){
				scrubberUpdater();
			},false);
		}

		if(document.getElementById("video2") !== null) {
			//console.log("video2 not null");
			document.getElementById("video2").addEventListener("canplay",function(){
				vid2Loaded = true; 
				//console.log('vid2Loaded = '+ vid2Loaded);
			},false);
		}

		  $(document).ready(function() {

		$(document).on('keydown',function (e) {
    		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    		if (key === 32){
       			e.preventDefault();
    			if(c_playState === 1 || c_playState === 2){
    				playButton();
    				//console.log("cradle playButton(); event");
    			}
    		}
 		});

 		$("#playElement").on('click', function () {
 			//console.log('playElement');
			playButton();
		}).on('mouseover', function (){
			//console.log("c_playState: " + c_playState);
			if(c_playState === 1){
				$("#playElement").css({'background':'url(cradle/art/pauseWhite.png)'})
			} else {				
				$("#playElement").css({'background':'url(cradle/art/playWhite.png)'})
			}
		}).on('mouseout', function (){
			if(c_playState === 1){
				$("#playElement").css({'background':'url(cradle/art/playWhite.png)'})
			} else {				
				$("#playElement").css({'background':'url(cradle/art/pauseGray.png)'})
			}
		});

		//cradle_openscreen();

	// });

		$("#instructions").on('click', function () { 
			if(!_ammobile){ 
				playDecide() 
			} 
			cradle_closescreen(); 
		});

		//console.log('tried to update cradle listeners');
		
		//enablecontrols();

		$(document).scrollsnap({
			snaps: '.snap',
			proximity: 180,
			handler: cradle_scrollsnaphandle
	});

  	var chome = document.getElementById("home_button_cmain");
	$("#home_button_cmain").on('click', function() {
		//console.log("go home");
		animateHome();
		pauseVids();
		document.getElementById("video1").currentTime = 0;
		document.getElementById("video2").currentTime = 0;

   		// document.getElementById("audio_norm").currentTime = 0;
    	// document.getElementById("audio_yeti").currentTime = 0;
    	// cradleLoaded = false;
	});

  var chome_bottom = document.getElementById("home_button_cbottom");
  $("#home_button_cbottom").on('click', function() {
    //console.log("go home");
    animateHome();
    pauseVids();
    document.getElementById("video1").currentTime = 0;
    document.getElementById("video2").currentTime = 0;
    // document.getElementById("audio_norm").currentTime = 0;
    // document.getElementById("audio_yeti").currentTime = 0;

    // cradleLoaded = false;
    //TODO: also set audio to 0
  });

    $("#periphery_cbutton").on('click', function() {
  		//console.log("go to periphery page");
  		animateButton(3);
  		pauseVids();
    	document.getElementById("video1").currentTime = 0;
   		document.getElementById("video2").currentTime = 0;
  	});

  	$("#legacy_cbutton").on('click', function() {
  		//console.log("go to legacy page");
  		animateButton(1);
  		pauseVids();
    	document.getElementById("video1").currentTime = 0;
    	document.getElementById("video2").currentTime = 0;
  	});

  	$("#migrants_cbutton").on('click', function() {
  		//console.log("go to migrants page");
  		animateButton(2);
  		pauseVids();
    	document.getElementById("video1").currentTime = 0;
    	document.getElementById("video2").currentTime = 0;
  	});


});

}

var loadLegacy = function () {
 
//this works, but doesn't load cradle css
$("#legacyContent").load("/legacy/index.html #legacy_wrapper", function() {
	//console.log("legacy was loaded");
	legacyLoaded = true;
	var cssLink = "/legacy/css/style.css";
	var jsLink = "/legacy/js/core.js";
    // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
    //console.log("THis is the css link : " + cssLink);
   //  $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
   // .appendTo("head");
   $.getScript(jsLink, function(){
   		//console.log('hi');
   	$("#outerinner").on('mouseenter', function(){
   		//console.log('zzz');
   	});
   });

   $.get(cssLink, function(css) {
   		$('<style type="text/css"></style>')
     		.html(css)
      		// .appendTo("head");
      		//console.log("got legacy css");
	});
   $("#legacyContent").css({'width': '100%', 'height': '100%'});
   $(".legacy_top").css({'background': 'none'});
   $(".yellow").css({'background': 'none'});
   //$("#cradleContent").css({'display': 'none'});
   $("#legacyContent").fadeIn(1000);
 });
}

var loadPeriphery = function () {
 
//this works, but doesn't load cradle css
$("#peripheryContent").load("/periphery/index.html #periphery_wrapper", function() {
	//console.log("periphery was loaded");
	peripheryLoaded = true;
	var cssLink = "/periphery/css/style.css";
	var jsLink = "/periphery/js/periphery.js";
    // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
    //console.log("THis is the css link : " + cssLink);
   //  $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
   // .appendTo("head");
   $.getScript(jsLink, function(){
   		attachPeripheryEvents();
   		//console.log('periphery getScript');
   		//$("#outerinner").on('mouseenter', function(){console.log('zzz');});
   });

   $.get(cssLink, function(css) {
   		$('<style type="text/css"></style>')
     		.html(css)
      		// .appendTo("head");
      		//console.log("got periphery css");
	});
   $("#peripheryContent").css({'width': '100%', 'height': '100%'});
   $(".periphery_top").css({'background': 'none'});
   //$("#cradleContent").css({'display': 'none'});
   $("#peripheryContent").fadeIn(1000);
 });
}

function attachPeripheryEvents() {
	if(document.getElementById("target") !== null) {
			//console.log("target not null");
			document.getElementById("target").addEventListener("canplay",function(){
				p_vidLoaded = true; 
				//console.log('p_vidLoaded = '+ p_vidLoaded);
			},true);
			document.getElementById("target").addEventListener("ended",function(){ 
				p_endVids();
			},true);
			document.getElementById("target").addEventListener("timeupdate",function(){
				p_scrubberUpdater();
			},true);
		}

	// $(document).on('keydown', function (e) {
 //    	var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
 //    	if (key == 32) {
 //      		e.preventDefault();
 //      	if(p_playState === 1 || p_playState === 2){
	// 		 p_playButton();
 //        	 console.log("p_playButton stuff");
 //      		}
 //    	}
 // 	});
  $(document).ready(function() {


  	//p_enablecontrols();

  	//console.log('tried to update periphery listeners');

	$("#playElement").on('click', function() {
  		p_playButton();
  	}).on('mouseover', function() {
 		if(p_playState == 1){
   			$("#playElement").css({'background':'url(art/pauseWhite.png)'})
    	} else {        
     		$("#playElement").css({'background':'url(art/playWhite.png)'})
    	}
  		}).on('mouseout', function() {
    	if(p_playState == 1){
      		$("#playElement").css({'background':'url(art/playWhite.png)'})
   		} else {        
     		$("#playElement").css({'background':'url(art/pauseGray.png)'})
    	}
  	});

  	$("#p_instructions").on('click', function () { 
    if(!_ammobile){ 
      p_playDecide();
    } 
    periphery_closescreen(); 
  });

  	$(document).scrollsnap({
    	snaps: '.snap',
    	proximity: 180,
    	handler: periphery_scrollsnaphandle
  });


  var phome = document.getElementById("home_button_pmain");
	$("#home_button_pmain").on('click', function() {
		//console.log("go home");
		animateHome();
		p_pauseVids();
		document.getElementById("target").currentTime = 0;
   		document.getElementById("audio_norm").currentTime = 0;
    	document.getElementById("audio_yeti").currentTime = 0;
	});

  var phome_bottom = document.getElementById("home_button_pbottom");
  $("#home_button_pbottom").on('click', function() {
    //console.log("go home");
    animateHome();
    p_pauseVids();
    document.getElementById("target").currentTime = 0;
    document.getElementById("audio_norm").currentTime = 0;
    document.getElementById("audio_yeti").currentTime = 0;
    //TODO: also set audio to 0
  });


  	$("#cradle_pbutton").on('click', function() {
  		//console.log("go to cradle page");
  		animateButton(0);
  		p_pauseVids();
  		document.getElementById("target").currentTime = 0;
    	document.getElementById("audio_norm").currentTime = 0;
    	document.getElementById("audio_yeti").currentTime = 0;
  	});

  	$("#legacy_pbutton").on('click', function() {
  		//console.log("go to legacy page");
  		animateButton(1);
  		p_pauseVids();
  		document.getElementById("target").currentTime = 0;
    	document.getElementById("audio_norm").currentTime = 0;
    	document.getElementById("audio_yeti").currentTime = 0;
  	});

  	$("#migrants_pbutton").on('click', function() {
  		//console.log("go to migrants page");
  		animateButton(2);
  		p_pauseVids();
  		document.getElementById("target").currentTime = 0;
    	document.getElementById("audio_norm").currentTime = 0;
    	document.getElementById("audio_yeti").currentTime = 0;
  	});


  });
  


}

// $("#cradleContent").heightMultiplierl("Loading...");
 	
 	
//     var pagelink = "cradle/";
//     var url = pagelink + "index.html";

//  	console.log("this is the url im loading  : "+ url);
//     $.ajax({
//         url : url,
//         type : "GET",
//         dataType : "html",
//         context: cradleContent
//     }).done(function(data) {
//     	var $result = $(data).filter('#cradle_wrapper');
//         $("#cradleContent").html($result);
//         $("#cradleContent link").each(function() {
//             //var cssLink = pagelink + $(this).attr('href');
//             var cssLink = "cradle/css/style.css";
//             // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
//             console.log("THis is the css link : " + cssLink);
//             $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
//    .appendTo("head");
//             // $("head").append("  <link href= \'' "+  cssLink " \'' " +"rel= \'stylesheet \'' />");
//         });
//         $("#cradleContent script").each(function() {
//             //var jsLink = pagelink + $(this).attr('src');
//             var jsLink = "cradle/js/cradle.js";

//             console.log("THis is the js link : " + jsLink);
//             $('<script type="text/javascript" src="'+jsLink+'">').appendTo("head");
//             cradleLoaded = true;
//             // $("head").append("<script type="text/javascript" src="&quot; + jsLink + &quot;"></script>");
//  });


 
//  }).fail(function(jqXHR, textStatus, errorThrown) {
//  	$("#cradleContent").html("Error!! File is not loaded");
//  });

// }

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
	// if(opacity === 0) {
	// 	bottom.hide();
	// } else if (opacity === 1){
	// 	bottom.show();
	// }
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

	var w = $("#container").width();
	var h = $("#container").height();
	var rMargin = 200;
	
	$("#titleblock").css({ 'left': ((w/2)+ rMargin), 'top': (86)});
	$("#pinchelines").css({ 'height': (h-(86+80)), 'left': ((w/2) + (rMargin + 544)), 'top': 162 });
	$("#preaching").css({ 'left': ((w / 2) + rMargin + 400), 'top': ( h - 70) });
	$("#legacy").css({ 'top': ((h/2) - 280), left: ((w/4) - 230) });
	$("#cradle").css({ 'top': ((h/2) + 20), left: ((w/4) - 230) });

	$("#bodytext").css( { 'left': ((w/2) + rMargin), 'top': 220 });

		paper.changeSize(w, h, true, false);
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



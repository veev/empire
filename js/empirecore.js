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
	bigRadHeightShift: 310,
	smCradleRadius: 100,
	smRadiusOffset: 70,
	bottomLetterOffset: 30,
	rippleGrowSpeed: 500,
	titleFadeSpeed: 500,
	theta: 40.10359804
};

var cradleLoaded = false;
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

	}

	else{

	console.log("Im in ready ");
	w = $("#container").width();
	h = $("#container").height();
	paper = Raphael('canvas_container', w, h);
	

	buildRipples(total); //creates four ripples

	//loadCradlePage();
	drawer();
	$("#containerinner").fadeIn();

	// var navVisible = $( "#navigation" ).is( ":visible" );

	// if (navVisible) {
	// 	$("#home_button")
	// }

	//if $("navigation" :visible)
	var home = document.getElementById("home_button");
	$("#home_button").on('click', function() {
		console.log("go home");
		animateHome();
	});
 }
});

$(window).resize(drawer);
//$(window).resize(buildRipples(total));


function buildRippleNode(index){
	var ripple, title, bottomLetter, topLetter;
	var offset = 180;
	var pos = (offset * index) + offset; //radius of Home Button
	var titleOffset = config.titleOffset;
	var titleHeight = config.titleHeight;

	//topLetter variables
	var smCradleR = config.smCradleRadius;
	var smRadiusOffset = config.smRadiusOffset;
	var topLetX = smCradleR/2 + (smRadiusOffset * index);

	//bottomLetter variables
	var bigRadiusOffset = config.bigRadiusOffset;
	var posX = w + (bigRadiusOffset * index);
	//var posY = posX - config.bigRadHeightShift;
	var posY = posX * (0.8154762);
	var bottomLetterOffset = config.bottomLetterOffset;
	var theta = config.theta;
	var rad = Math.PI/180;
	var botLetX = (posX * Math.cos(theta*rad)) + (bottomLetterOffset * index);

	ripple = paper.path("M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z")
	ripple.attr({'fill': COLORS[index], 'fill': URL[index], 'stroke': COLORS[index]})
		  .data('name_', RIPPLE_ID[index]);
	ripple.patternTmp = ripple.pattern;
	delete ripple.pattern;
	title = paper.text(pos - titleOffset, titleHeight, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	topLetter = paper.text(topLetX, titleHeight, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	bottomLetter = paper.text(botLetX, (h - titleHeight), LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
    
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
	console.log('hola ', this.title);
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

		// // if(this.index !== i){
		// 		//set all the other ripples to not active / not big
		// 		// this.ripple.isActive = false;
		// 		// this.ripple.isBig = false;	
		// // }

		// this.ripple.isActive = true;
		// console.log( this.index +"is active = " + this.ripple.isActive);

		// if (this.ripple.isActive && !this.ripple.isBig) {
		// 	growRippleNode(this.index);	 			
		// 	$("#navigation").fadeIn();
	 // 		$("#containerinner").fadeOut(function() {
	 // 			if(this.index === 0){

		// 			loadCradle();
		// 		}
	 // 		});		
		// 	fadeTitles(0);				
		// 	this.ripple.isBig = true;
		// 	console.log(index + " is big = " + this.ripple.isBig);
		// 	this.ripple.isActive = false;
		// 	console.log(index+" is active = " + this.ripple.isActive);

		// } else if (!this.ripple.isBig) {
		// 		console.log("Shrinking menu["+index+"]")
		// 		shrinkRippleNode(1);
		// }	 		
			//growRippleNode(this.index);
			// if(this.index === 0){
			// 	loadCradle();
			// }
		});
		//button.on('click', handleMenu);
		menu.unshift(button);
	}

	for(var i = 0; i < total; i++) {
		console.log(menu[i].id);
	}
}

function animateButton(index){

//interactivity for ripple navigation
	console.log('console here', index)

		for(var i = 0; i < menu.length; i++ ) {
			if(index !== i){
				//set all the other ripples to not active / not big
				menu[index].ripple.isActive = false;
				menu[index].ripple.isBig = false;	
			}
		}
		//set this ripple to active	
		menu[index].ripple.isActive = true;
		console.log("menu[" + index + "] is active = " + menu[index].ripple.isActive);

		if (menu[index].ripple.isActive && !menu[index].ripple.isBig) {
			growRippleNode(index, function() {
				if(index === 0){
					loadCradle();
					$("#cradleContent").css({"display" : ""});
					//loadCradle2();
				} else {
					$("#cradleContent").css({"display" : "none"});
				}
			});	 			
			$("#navigation").fadeIn();
	 		$("#containerinner").fadeOut(function() {

	 		});


			//fade out titles (pass in opacity)
			fadeTitles(0);				
			menu[index].ripple.isBig = true;
			console.log("menu["+index+"] is big = " + menu[index].ripple.isBig);
			menu[index].ripple.isActive = false;
			console.log("menu["+index+"] is active = " + menu[index].ripple.isActive);

			// if(index === 0){
			// 	loadCradle();
			// }

		} else if (!menu[index].ripple.isBig) {
			console.log("Shrinking menu["+index+"]")
			//shrinkRippleNode(1);
			shrinkRippleNode(index);
		}
}


function growRipples() {

}

function growRippleNode(index, callback) {
	var speed = config.rippleGrowSpeed;
	var bigRadiusOffset = config.bigRadiusOffset;

	for(var i = index; i < menu.length; i++) {
		var ripple = menu[i].ripple;
		var posX = w + (bigRadiusOffset * i);
		//var posY = posX - config.bigRadHeightShift;
		var posY = posX * (0.8154762); //multiplier is same as ((posX - bigRadHeightShift)/ posX)
		ripple.animate({path: "M0,0 L" + posX +",0 A" + posX +"," + posY + " 0 0,1 0," + posY + "z"}, speed,
		function() {
			//$(document).trigger("animation.end");
			for(var i = index; i < menu.length; i++) {

				var _index = i+1
				if( i === menu.length-1) {
					continue;
				}

				fadeBottomLetters( _index, 1);
				fadeTopLetters(i, 0);
			}
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
		var ripple = menu[i].ripple;
		var pos = smCradleR + (smRadiusOffset * i);
		ripple.animate({path: "M0,0 L" + pos +",0 A" + pos +"," + pos + " 0 0,1 0," + pos + "z"}, speed,
		function() {
			//$(document).trigger("animation.end");
			 for(var i = 0; i <= index; i++) {

			 	var _index = i + 1;
			 	if(i === menu.length - 1) {
			 		continue;
			 	}
			 	fadeTopLetters( i, 1);
			 	fadeBottomLetters( _index, 0);

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

	var ripple = menu[index].ripple;
	ripple.animate({path: "M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z"}, speed,
	function() {
		//$(document).trigger("animation.end");
		//fade in titles, opacity = 1
		fadeTitles(1);
		$("#navigation").fadeOut();
 		$("#containerinner").fadeIn();
 		$("#cradleContent").fadeOut();
 		console.log("In animate home");
	});
	//set menus to not big, not active
	menu[index].isActive = false;
	menu[index].isBig = false;
}

// function loadCradlePage() {
// 	//buildRipples(total);
// 	var bigRadiusOffset = config.bigRadiusOffset;

// 	for (var i = 0; i < menu.length; i++) {
// 		var ripple = menu[i].ripple;
// 		var posX = w + (bigRadiusOffset * i);
// 		//var posY = posX - config.bigRadHeightShift;
// 		var posY = posX * (0.8154762); //multiplier is same as ((posX - bigRadHeightShift)/ posX)
// 		ripple = paper.path("M0,0 L" + posX +",0 A" + posX +"," + posY + " 0 0,1 0," + posY + "z");

// 		var _index = i + 1;
// 		if(i === menu.length - 1) {
// 			 continue;
// 		}
// 		fadeBottomLetters( _index, 1);
// 	}
// 	// growRippleNode(0);
//  // 	$("#navigation").fadeIn();
//  // 	$("#containerinner").fadeOut();
// 	// //fade out titles (pass in opacity)
// 	// fadeTitles(0);
// }

var loadCradle2 = function() {
	$("cradleContent2").load("/cradle/index.html #cradle_main", function() {
	var cssLink = "/cradle/css/style.css";
    // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
    console.log("THis is the css link : " + cssLink);
   //  $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
   // .appendTo("head");

   $.get(cssLink, function(css) {
   		$('<style type="text/css"></style>')
     		.html(css)
      		// .appendTo("head");
	});
   $("#cradleContent2").css({'width': '100%', 'height': '98%'});
});
}

var loadCradle = function () {
	//growRippleNode(0);
	//$("#navigation").fadeIn();
	//$("containerinner").fadeOut();
	//fade out titles (pass in opacity)
	//fadeTitles(0);

//this works, but doesn't load cradle css
$("#cradleContent").load("/cradle/index.html #cradle_wrapper", function() {
	console.log("cradle was loaded");
	cradleLoaded = true;
	var cssLink = "/cradle/css/style.css";
	var jsLink = "/cradle/js/cradle.js";
    // $("head").append("  <link href="+ &quot; + cssLink + &quot; +" rel="stylesheet" />");
    console.log("THis is the css link : " + cssLink);
   //  $('<link rel="stylesheet" type="text/css" href="'+cssLink+'" >')
   // .appendTo("head");

   $.get(cssLink, function(css) {
   		$('<style type="text/css"></style>')
     		.html(css)
      		// .appendTo("head");
	});
   $.getScript(jsLink);
   $("#cradleContent").css({'width': '100%', 'height': '98%'});
   $(".cradle_top").css({'background': 'none'});
   //$("#cradle_structure").css({'top': '70', 'left': '30%'});
   //$("#cradleContent").fadeIn();
	// e.preventDefault();
	// $.getScript("/cradle/js/cradle.js");
    //$.getCSS({href:"cradle/css/style.css", media:"screen"});
    // $.getCSS("/cradle/css/style.css");
 });




// $("#cradleContent").html("Loading...");
 	
 	
//     var pagelink = "cradle/";
//     var url = pagelink + "index.html";
//  	console.log("this is the url im loading  : "+ url);
//     $.ajax({
//         url : url,
//         type : "GET",
//         dataType : "html",
//         context: cradleContent
//     }).done(function(data) {
//         $("#cradleContent").html(data);
//         $("#cradleContent link").each(function() {
//             //var cssLink = pagelink + $(this).attr('href');
//             var cssLink = "/cradle/css/style.css";
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
//  $("#cradleContent").html("Error!! File is not loaded");
//  });

}

function fadeTitleNode(index, opacity) {
	var speed = config.titleFadeSpeed;
	var title = menu[index].title;
	title.animate({'opacity': opacity}, speed);
}

function fadeTitles(opacity) {
	for(var i=0; i<menu.length; i++){
		fadeTitleNode(i, opacity);
		console.log("fade");
	}
}

function fadeBottomLetters(index, opacity) {
	var speed = config.titleFadeSpeed;
	var bottom = menu[index].bottomLetter;
	bottom.animate({'opacity': opacity}, speed);
	if(opacity === 0) {
		bottom.hide();
	} else if (opacity === 1){
		bottom.show();
	}
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



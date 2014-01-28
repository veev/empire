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
	rippleGrowSpeed: 1000,
	titleFadeSpeed: 500,
	theta: 40.10359804
};
var menu = [];
var RIPPLE_ID = ['ripple_c', 'ripple_l', 'ripple_m', 'ripple_p'];
var LABELS = ['Cradle','Legacy','Migrants', 'Periphery'];
var LETTERS = ['C', 'L', 'M', 'P'];
var COLORS = ['#ecda50', '#fbb03b', '#ff5a00', '#cc3333'];
var URL = ['url(art/c_bg.jpg)', 'url(art/l_bg.jpg)', 'url(art/m_bg.jpg)', 'url(art/p_bg.jpg)' ];

$(document).ready(function () {

	w = $("#container").width();
	h = $("#container").height();
	paper = Raphael('canvas_container', w, h);
	
	buildRipples(total); //creates four ripples
	//setRippleID(4);
	drawer();
	$("#containerinner").fadeIn();

	//fadeTitles(0);

	// if (c_isBig) {
	// 	c_top.animate({'opacity': 0}, 1000);
	// } 
	// if (l_isBig ) {
	// 	l_bottom.animate({'opacity': 0}, 1000);
	// 	l_bottom.hide();
	// }
// 	$(document).on('animation.end', function(){
// 		console.log('animation done');
// 	});

// ripple_c.open = false;
// 	ripple_c.click(function() {
// 		ripple_c.open = !ripple_c.open;
// 		console.log("c was clicked ", this);
		
// 		$("#navigation").fadeIn();
// 		$("#containerinner").fadeOut();

// 		//fade out titles
// 		fadeTitles(0);
// 	});
	// for(var i = 0; i < total; i++) {
	// 	menu[i].ripple.isActive = false;
	// 	menu[i].ripple.click(function() {
	// 		menu[i].ripple.isActive = !menu[i].ripple.isActive;
	// 		//console.log(menu[0] + " was clicked");
	// 		console.log("menu[i] is active = " + menu[i].ripple.isActive);
	// 		if (menu[i].ripple.isActive) {
	// 			growRippleNode(i);
 // 				$("#navigation").fadeIn();
 // 				$("#containerinner").fadeOut();
	// 			//fade out titles (pass in opacity)
	// 			fadeTitles(0);
	// 		} else {
	// 			shrinkRippleNode(i);
	// 		}
	// 	});
	// }


	menu[0].ripple.isActive = false;
	menu[0].ripple.click(function() {
		menu[0].ripple.isActive = !menu[0].ripple.isActive;
		//console.log(menu[0] + " was clicked");
		console.log("menu[0] is active = " + menu[0].ripple.isActive);
		if (menu[0].ripple.isActive) {
			growRippleNode(0);
 			$("#navigation").fadeIn();
 			$("#containerinner").fadeOut();
			//fade out titles (pass in opacity)
			fadeTitles(0);
		} else {
			shrinkRippleNode(0);
		}

	});

	menu[1].ripple.isActive = false;
	menu[1].ripple.click(function() {
		menu[1].ripple.isActive = !menu[1].ripple.isActive;
		//console.log(menu[0] + " was clicked");
		console.log("menu[1] is active = " + menu[1].ripple.isActive);
		if (menu[1].ripple.isActive) {
			growRippleNode(1);
 			$("#navigation").fadeIn();
 			$("#containerinner").fadeOut();
			//fade out titles (pass in opacity)
			fadeTitles(0);
		} else {
			shrinkRippleNode(1);
		}

	});

	menu[2].ripple.isActive = false;
	menu[2].ripple.click(function() {
		menu[2].ripple.isActive = !menu[2].ripple.isActive;
		//console.log(menu[0] + " was clicked");
		console.log("menu[2] is active = " + menu[2].ripple.isActive);
		if (menu[2].ripple.isActive) {
			growRippleNode(2);
 			$("#navigation").fadeIn();
 			$("#containerinner").fadeOut();
			//fade out titles (pass in opacity)
			fadeTitles(0);
		} else {
			shrinkRippleNode(2);
		}

	});

	menu[3].ripple.isActive = false;
	menu[3].ripple.click(function() {
		menu[3].ripple.isActive = !menu[3].ripple.isActive;
		//console.log(menu[0] + " was clicked");
		console.log("menu[3] is active = " + menu[3].ripple.isActive);
		if (menu[3].ripple.isActive) {
			growRippleNode(3);
 			$("#navigation").fadeIn();
 			$("#containerinner").fadeOut();
			//fade out titles (pass in opacity)
			fadeTitles(0);
		} else {
			shrinkRippleNode(3);
		}

	});


});

$(window).resize(drawer);

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
		  .data('id', RIPPLE_ID[index]);
	title = paper.text(pos - titleOffset, titleHeight, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	topLetter = paper.text(topLetX, titleHeight, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	bottomLetter = paper.text(botLetX, (h - titleHeight), LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
    return {ripple: ripple, title: title, topLetter: topLetter, bottomLetter: bottomLetter};
}

function bottomLetterPlacing() {

}

function Button(ripple, title, topLetter, bottomLetter, isActive) {
	this.ripple = ripple;
	this.title = title;
	this.topLetter = topLetter;
	this.bottomLetter = bottomLetter;
	this.isActive = isActive;

	// var ripple, title, bottomLetter, topLetter;
	// var offset = 180;
	// var pos = (offset * index) + offset; //radius of Home Button
	// var titleOffset = config.titleOffset;
	// var titleHeight = config.titleHeight;
	// ripple = paper.path("M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z")
	// ripple.attr({'fill': COLORS[index], 'fill': URL[index], 'stroke': COLORS[index]})
	// 	  .data('id', RIPPLE_ID[index]);
	// title = paper.text(pos - titleOffset, titleHeight, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	// topLetter = paper.text(pos - titleOffset, titleHeight, LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	// bottomLetter = paper.text((w-155), (h - titleHeight), LETTERS[index]).attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
 //    return {ripple: ripple, title: title, topLetter: topLetter, bottomLetter: bottomLetter};
}

function buildRipples(total) {	

	//var button = new Button();
	var button;
	for(var index = total-1; index >= 0; index--)
	{
		button = buildRippleNode(index);
		//button.on('click', handleMenu);
		menu.unshift(button);

	}

	for(var i = 0; i < total; i++) {
		console.log(menu[i].bottomLetter);
	}
	
}

// function setRippleID(total) {
// 	for (var i = 0; i < total; i++) {
// 		ripples[i] = menu[i].button.ripple;
// 		console.log(ripples[i]);
// 	}
// }

function growRipples() {

}

function growRippleNode(index) {
	var speed = config.rippleGrowSpeed;
	var bigRadiusOffset = config.bigRadiusOffset;

	for(var i = index; i < menu.length; i++) {
		var ripple = menu[i].ripple;
		var posX = w + (bigRadiusOffset * i);
		//var posY = posX - config.bigRadHeightShift;
		var posY = posX * (0.8154762); //multiplier is same as ((posX - bigRadHeightShift)/ posX)
		ripple.animate({path: "M0,0 L" + posX +",0 A" + posX +"," + posY + " 0 0,1 0," + posY + "z"}, speed,
		function() {
			$(document).trigger("animation.end");
			for(var i = index; i < menu.length; i++) {
				// if(i > menu.length-1) {
				// 	continue;
				// } 
					//fadeBottomLetters(i + 1, 1);
					var _index = i+1
					if( i === menu.length-1) {
						continue;
					}
	
					fadeBottomLetters( _index, 1);
					fadeTopLetters(i, 0);

			}
			// for(var i = index; i < menu.length; i++) {
			// 	if(index === 0 ) {
			// 		fadeBottomLetters(i+1, 1);
			// 	} else if (index === 3) {
			// 		fadeTopLetters(i-1, 1);
			// 	} else {
			// 		fadeBottomLetters(i+1, 1);
			// 		fadeTopLetters(i-1, 1);
			// 	}
			// }
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
		var ripple = menu[i].ripple;
		var pos = smCradleR + (smRadiusOffset * i);
		ripple.animate({path: "M0,0 L" + pos +",0 A" + pos +"," + pos + " 0 0,1 0," + pos + "z"}, speed,
		function() {
			$(document).trigger("animation.end");
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


function fadeBottomLetters(index, opacity) {
	var speed = config.titleFadeSpeed;
	var bottom = menu[index].bottomLetter;
	bottom.animate({'opacity': opacity}, speed);
}

function fadeTopLetters(index, opacity) {
	var speed = config.titleFadeSpeed;
	var top = menu[index].topLetter;
	top.animate({'opacity': opacity}, speed);
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



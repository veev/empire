// core routines for empire
var audioactive = false;
var audiovolume = 30;
var _currentaudiovolume = 0;
var vIvl = new Number();

$(document).ready(function () {

	// load ambient audio
	$('body:first').append('<div id="audiodiv" style="display: none"><audio src="../audio/ambiance.mp3" type="audio/mpeg" loop id="ambientaudio"></audio></div>');
	document.getElementById('ambientaudio').addEventListener('canplaythrough',audioready);

	drawer();
	$("#containerinner").fadeIn();

			
});

function drawer () {

	var w = $("#container").width();
	var h = $("#container").height();
	
	$("#titleblock").css({ 'left': ((w / 2) - 181), 'top': ((h / 2) - 86) });
	$("#pinchelines").css({ 'height': (h / 2) + 90, 'left': ((w / 2) + 208), 'top': ((h / 2) - 280) });
	$("#preaching").css({ 'left': ((w / 2) + 215), 'top': ( h - 70) });
	$("#legacy").css({ 'top': ((h/2) - 280), left: ((w/4) - 230) });
	$("#cradle").css({ 'top': ((h/2) + 20), left: ((w/4) - 230) });

	$("#bodytext").css( { 'left': ((w / 2) + 220), 'top':  ((h / 2) - 220) });
	
}

$(window).resize(drawer);

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
	_currentaudiovolume -= 5;
	if(_currentaudiovolume == 0){
		clearInterval(vIvl);
		document.getElementById('ambientaudio').stop();
	}
}

function audiostop () {
	vIvl = setInterval(_volfadeout,100);
	audioactive = false;
	
}
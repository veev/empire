// core routines for empire
var ripplemode = true;
var current_ripple = 0;
var audioactive = false;
var audiovolume = 30;
var _currentaudiovolume = 0;
var vIvl = new Number();
var dontannoysam = false;
var _ammobile = false;
var _canhls = true;

$(document).ready(function () {

	if(navigator.userAgent.indexOf('iPad') != -1 || navigator.userAgent.indexOf('Android 4') != -1){
		_ammobile = true;
	}
	
	if(navigator.userAgent.indexOf('Android 4') != -1){
//		_canhls = false;
	}

	// load ambient audio
	
	if(window.location.href.indexOf("noaudio") != -1){
		dontannoysam = true;
	}
	
	if(!dontannoysam && !_ammobile){
		$('body:first').append('<div id="audiodiv" style="display: none"><audio src="../audio/ambiance.mp3" type="audio/mpeg" loop id="ambientaudio"></audio></div>');
		document.getElementById('ambientaudio').addEventListener('canplaythrough',audioready);
	}
	
	buildripples();

});


function buildripples () {	
	
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
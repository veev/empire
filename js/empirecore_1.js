// core routines for empire
var ripplemode = true;
var current_ripple = 0;
var audioactive = false;
var audiovolume = 20;
var _currentaudiovolume = 0;
var vIvl = new Number();
var dontannoysam = false;
var _ammobile = false;
var _canhls = true;
var paper, ripple_p, ripple_m, ripple_l, ripple_c;
var p_title, m_title, l_title, c_title;
var p_bottom, m_bottom, l_bottom, c_top, l_top, m_top;
var cx, cy = 0;
var c_bg_r = window.innerWidth;
var l_bg_r = window.innerWidth + 60;
var m_bg_r = window.innerWidth + 120;
var p_bg_r = window.innerWidth + 180;
var c_sm_r = 100;
var l_sm_r = 170;
var m_sm_r = 240;
var hShift = 310;
var c_bg_y = c_bg_r - hShift;
var l_bg_y = l_bg_r - hShift;
var m_bg_y = m_bg_r - hShift;
var p_bg_y = p_bg_r - hShift;
var c_isBig, l_isBig, m_isBig, p_isBig = false;
var w, h;
var config = {
	titleOffset:90,
	animationSpeed:1000
};
$(document).ready(function () {

	w = $("#container").width();
	h = $("#container").height();
	paper = Raphael('canvas_container', window.innerWidth, window.innerHeight);

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
	drawer();
	$("#containerinner").fadeIn();

	// if (c_isBig) {
	// 	c_top.animate({'opacity': 0}, 1000);
	// } 
	// if (l_isBig ) {
	// 	l_bottom.animate({'opacity': 0}, 1000);
	// 	l_bottom.hide();
	// }
$(document).on('animation.end', function(){
	console.log('animation done');
});
ripple_c.open = false;
	ripple_c.click(function() {
		ripple_c.open = !ripple_c.open;
		console.log("c was clicked ", this);
		
		ripple_p.animate({path: "M0,0 L" +p_bg_r +",0 A" +p_bg_r +"," +p_bg_y+ " 0 0,1 0," +p_bg_y+ "z"}, 1000,
			function() {
				$(document).trigger("animation.end");
				p_bottom.animate({'opacity': 1}, 1000);
			});
		ripple_m.animate({path: "M0,0 L" +m_bg_r +",0 A" +m_bg_r +"," +m_bg_y+ " 0 0,1 0," +m_bg_y+ "z"}, 1000,
			function() {
				$(document).trigger("animation.end");
				m_bottom.animate({'opacity': 1}, 1000);
			});
		ripple_l.animate({path: "M0,0 L" +l_bg_r +",0 A" +l_bg_r +"," +l_bg_y+ " 0 0,1 0," +l_bg_y+ "z"}, 1000,
			function() {
				$(document).trigger("animation.end");
				l_bottom.animate({'opacity': 1}, 1000);
			});			
		ripple_c.animate({path: "M0,0 L" +c_bg_r +",0 A" +c_bg_r +"," +c_bg_y+ " 0 0,1 0," +c_bg_y+ "z"}, 1000);

		$("#navigation").fadeIn();
		$("#containerinner").fadeOut();


		fadeOutTitles();
		c_isBig = !c_isBig;
		console.log("c_isBig = " + c_isBig);
		//p_bottom.animate({'opacity': 1}, 1000);
		if (c_isBig) {
			c_top.animate({'opacity': 0}, 1000);
			l_bottom.animate({'opacity': 1}, 2000);
			m_bottom.animate({'opacity': 1}, 2000);
			p_bottom.animate({'opacity': 1}, 2000);
		} 

	});

	ripple_l.click(function() {
		console.log("l was clicked");
		ripple_p.animate({path: "M0,0 L" +p_bg_r +",0 A" +p_bg_r +"," +p_bg_y+ " 0 0,1 0," +p_bg_y+ "z"}, 1000,
			function() {
				p_bottom.animate({'opacity': 1}, 1000);
			});
		ripple_m.animate({path: "M0,0 L" +m_bg_r +",0 A" +m_bg_r +"," +m_bg_y+ " 0 0,1 0," +m_bg_y+ "z"}, 1000,
			function() {
				m_bottom.animate({'opacity': 1}, 1000);
			});
		ripple_l.animate({path: "M0,0 L" +l_bg_r +",0 A" +l_bg_r +"," +l_bg_y+ " 0 0,1 0," +l_bg_y+ "z"}, 1000);
		// c stays in left corner but gets smaller
		ripple_c.animate({path: "M0,0 L" + c_sm_r +",0 A" + c_sm_r +"," + c_sm_r+ " 0 0,1 0," + c_sm_r+ "z"}, 1000,
			function() {
				c_top.animate({'opacity': 1}, 1000);
			}
			);

		$("#navigation").fadeIn();
		$("#containerinner").fadeOut();
		fadeOutTitles();
		l_isBig = !l_isBig;
		console.log("l_isBig = " + l_isBig);

		// if (l_isBig ) {
		// l_bottom.animate({'opacity': 0}, 1000);
		// l_bottom.hide();
		// }
	});

	ripple_m.click(function() {
		console.log("m was clicked");
		ripple_p.animate({path: "M0,0 L" +p_bg_r +",0 A" +p_bg_r +"," +p_bg_y+ " 0 0,1 0," +p_bg_y+ "z"}, 1000,
			function() {
				p_bottom.animate({'opacity': 1}, 1000);
			});		
		ripple_m.animate({path: "M0,0 L" +m_bg_r +",0 A" +m_bg_r +"," +m_bg_y+ " 0 0,1 0," +m_bg_y+ "z"}, 1000);
		// c and l stay in left corner but get smaller
		ripple_l.animate({path: "M0,0 L" + l_sm_r +",0 A" + l_sm_r +"," + l_sm_r + " 0 0,1 0," + l_sm_r + "z"}, 1000);
		ripple_c.animate({path: "M0,0 L" + c_sm_r +",0 A" + c_sm_r +"," + c_sm_r+ " 0 0,1 0," + c_sm_r+ "z"}, 1000);

		$("#navigation").fadeIn();
		$("#containerinner").fadeOut();
		fadeOutTitles();
	});

	ripple_p.click(function() {
		console.log("p was clicked");
		ripple_p.animate({path: "M0,0 L" + p_bg_r +",0 A" +p_bg_r +"," +p_bg_y+ " 0 0,1 0," +p_bg_y+ "z"}, 1000);
		// c l and m stay in left corner but get smaller
		ripple_m.animate({path: "M0,0 L" + m_sm_r +",0 A" + m_sm_r +"," + m_sm_r+ " 0 0,1 0," + m_sm_r + "z"}, 1000);
		ripple_l.animate({path: "M0,0 L" + l_sm_r +",0 A" + l_sm_r +"," + l_sm_r + " 0 0,1 0," + l_sm_r + "z"}, 1000);
		ripple_c.animate({path: "M0,0 L" + c_sm_r +",0 A" + c_sm_r +"," + c_sm_r+ " 0 0,1 0," + c_sm_r + "z"}, 1000);

		$("#navigation").fadeIn();
		$("#containerinner").fadeOut();
		fadeOutTitles();
	});

});

function fadeOutTitles() {
	 p_title.animate({'opacity': 0}, 500);
	 m_title.animate({'opacity': 0}, 500);
	 l_title.animate({'opacity': 0}, 500);
	 c_title.animate({'opacity': 0}, 500);
	 // p_title.hide();
	 // m_title.hide();
	 // l_title.hide();
	 // c_title.hide();
}
/*var LABELS = ['Cradle','Legacy','Migrants'...]
function buildRippleNode(index){
	var ripple, title bottom;
	var offset = 180;
	var pos = offset * index; //720
	var titleOffset = config.titleOffset;
	ripple = paper.path("M0,0 L"+pos+",0 A"+pos+","+pos+" 0 0,1 0,"+pos+"z");
	ripple.attr({'fill': '#cc3333', 'fill': 'url(art/p_bg.jpg)', 'stroke': '#cc3333'});
	title = paper.text(pos - titleOffset, 40, LABELS[index]).attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	//p_top = paper.text(630, 40, "P").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 0});
	bottom = paper.text((w-155), (h - 50), "P").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
}*/

function buildripples(total) {	
	// var w = $("#container").width();
	// var h = $("#container").height();
	// paper = Raphael('canvas_container', window.innerWidth, window.innerHeight);
	/*var button, menu = [];
	for(var i=0; i<total; i++)
	{
		button = buildRippleNode(i);
		button.on('click', handleMenu);
		menu.push(button);
	}*/

	ripple_p = paper.path("M0,0 L720,0 A720,720 0 0,1 0,720z");
	ripple_p.attr({'fill': '#cc3333', 'fill': 'url(art/p_bg.jpg)', 'stroke': '#cc3333'});
	p_title = paper.text(630, 40, "Periphery").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	//p_top = paper.text(630, 40, "P").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 0});
	p_bottom = paper.text((w-155), (h - 50), "P").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});

	ripple_m = paper.path("M0,0 L540,0 A540,540 0 0,1 0,540z");
	ripple_m.attr({'fill': '#ff5a00', 'fill': 'url(art/m_bg.jpg)', 'stroke': '#ff5a00'});
	m_title = paper.text(450, 40, "Migrants").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	m_top = paper.text(450, 40, "M").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	m_bottom = paper.text((w - 230), (h - 50), "M").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});

	ripple_l = paper.path("M0,0 L360,0 A360,360 0 0,1 0,360z");
	ripple_l.attr({'fill': '#fbb03b', 'fill': 'url(art/l_bg.jpg)', 'stroke': '#fbb03b'});
	l_title = paper.text(270, 40, "Legacy").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	l_top = paper.text(270, 40, "L").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	l_bottom = paper.text((w - 310), (h - 50), "L").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});

	ripple_c = paper.path("M0,0 L180,0 A180,180 0 0,1 0,180z");
	ripple_c.attr({'fill': '#ecda50', 'fill': 'url(art/c_bg.jpg)', 'stroke': '#ecda50'});
	c_title = paper.text(90, 40, "Cradle").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 1});
	c_top = paper.text(35, 40, "C").attr({'font-size': '28px', 'font-style': 'italic', 'opacity': 0});
	//c_bottom = paper.text((w-100), (h-40), "C").attr({'font-size': '24px', 'font-style': 'italic', 'opacity': 0});

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

$(window).resize(drawer);


function growRipples() {

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
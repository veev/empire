var clipdata = new Array();
var clipstarts = new Object();
var clipends = new Object();
var clipedges = new Object();
var cliplengths = new Object();
var cliprect = new Object();
var clipfirst = new Object();

//these were declared in empirecore.js, now cradle.js doesn't know about that
var audioactive = false;
var _ammobile = false;

var connsloaded = false;
var loadivl = new Number();
var clipmap = new Array('indonesia','india','southafrica','srilanka');
var paper,paper_connections,endpaper,drawpath;
var legacy_debug = false;

var _rtmpserver = 'rtmp://s17pilyt3yyjgf.cloudfront.net/cfx/st';
var _increment = 5;
var _scrubwidth = 0;
var _scrubheight = 0;
var _highlight_curvid = 0;
var _highlight_curpt = 0;
var _highlight_currentx = 0;
var _videoon = false;
var _legstarton = false;
var _endscreenon = false;
var _svglevel = false;
var _fson = false;
var _curw = new Number();
var _playbackx = new Number();
var _playbacky = new Number();
var _clipoffsetfromstart = 0;
var _clipstartsincemove = 0;
var _playbackctr = 90;
var _intransition = false;
var _hasended = false;
var _intransitions = 0;
var _legacy_firstrun = true;
var _starton = false;
var _adjuster = 140;
var _mladjust = 35;
var _mobileseek = 0;
var _inseek = false;

var _transitiontimer = new Number();
var _transitiontimerIvl = new Number();

var preventdoublejumpIvl = new Number();
var preventdoublejump = false;

var curvid = 0;
var curplayback = 0;
var curstart = 0;

var videotimes = new Array();
var vidjumpcnt = 0;
var segmentsseen = new Array();
var themetrack = { 'a':0, 'b':0, 'c':0, 'd':0, 'e':0 };
var litlines = new Object();
var liticons = new Object();
var gonescrubbers = new Object();
var gonelines = new Object();
var superfluouslinecheck = new Object();

var usage = new Object();

$(window).resize(function () {
	redrawing();
});


$(document).ready(function () {

	if(navigator.userAgent.indexOf('WebKit') == -1){
		$('body:first').append('<div id="browserno" style="display: none;"><div class="padded">Sorry, this experiment is only currently working in Google Chrome or Apple\'s Safari browser. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
		$("#browserno").slideDown();
	}

	if(_ammobile){
		$("#lg_fs").hide();
	}


	$("#legacy_container").css({ 'width': ($(window).width() - 40) });
	legacy_draw();
	
	
	$("#legplay").click(function () {
		$('html, body').animate({ scrollTop: ($('#legacy_container').offset().top - 20) }, 1000);
	});

	$("#legmore").click(function () {
		if(_fson){
			fullscreen_off();
		}
		if(_ammobile){
			document.getElementById('htmlvid').pause();
		} else {
			jwplayer("vidin").pause();
		}
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});
	
	var proximity = 350;
	if($(window).height() < 760){
		proximity = 150;
	}
	
	$(document).scrollsnap({
		snaps: '.snap',
		proximity: proximity,
//		handler: cradle_scrollsnaphandle
	});


	// clickability for the initial 4

	$("#legacy_containerinner").fadeIn();
	
	
	// hardcoded clip lengths
	
	cliplengths[0] = 599;
	cliplengths[1] = 662;
	cliplengths[2] = 742;
	cliplengths[3] = 558;
	

	// load the connections json
	
	$.ajax({
		dataType: "json",
		url: "connections.json",
		success: function (data) {
			connsloaded = true;
			clipdata = data;
		}});

	// once stuff has arrived render the spaces
	
	loadivl = setInterval(function () {
		if(connsloaded){
			clearInterval(loadivl);
			
			// now that we have our data we can do our thing
			var clipstart_a = new Object();
			var clipstart_b = new Object();
			var clipstart_c = new Object();
			var clipstart_d = new Object();
			var clipend_a = new Object();
			var clipend_b = new Object();
			var clipend_c = new Object();
			var clipend_d = new Object();
			var clipfinal_a = new Object();
			var clipfinal_b = new Object();
			var clipfinal_c = new Object();
			var clipfinal_d = new Object();

			// handle the data - plot all the points

			for(var x = 0; x < clipdata.length; x++){
				clipdata[x].fired = false;
				clipdata[x].headsup = false;
				clipdata[x].clicked = false;
				
				clipdata[x].dataid = x;
				
				clipdata[x].start_secs = timetosecs(clipdata[x].start);
				clipdata[x].end_secs = timetosecs(clipdata[x].end);
				clipdata[x].segend_secs = timetosecs(clipdata[x].segend);
				clipdata[x].seen = false;
				
				var cl = Math.floor(cliplengths[parseInt(clipdata[x].clip)]);
				if(clipdata[x].clip == "0"){
					clipstart_a[clipdata[x].start_secs] = x;
					clipend_a[clipdata[x].end_secs] = x;
					clipfinal_a[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "1"){
					clipstart_b[clipdata[x].start_secs] = x;
					clipend_b[clipdata[x].end_secs] = x;
					clipfinal_b[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "2"){
					clipstart_c[clipdata[x].start_secs] = x;
					clipend_c[clipdata[x].end_secs] = x;
					clipfinal_c[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "3"){
					clipstart_d[clipdata[x].start_secs] = x;
					clipend_d[clipdata[x].end_secs] = x;
					clipfinal_d[clipdata[x].segend_secs] = x;
				}
			}

			clipstarts[0] = clipstart_a;
			clipstarts[1] = clipstart_b;
			clipstarts[2] = clipstart_c;
			clipstarts[3] = clipstart_d;
			clipends[0] = clipend_a;
			clipends[1] = clipend_b;
			clipends[2] = clipend_c;
			clipends[3] = clipend_d;
			clipedges[0] = clipfinal_a;
			clipedges[1] = clipfinal_b;
			clipedges[2] = clipfinal_c;
			clipedges[3] = clipfinal_d;
			
			
			
	
			startscreen();
			
//			$(".videospace").hide();
//			endscreen('a',2);			
		}
	},500);
		
	// let's capture the spacebar since someone's worried about that
	
	$(document).keydown(function (e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (key == 32){
       e.preventDefault();
    	if(_videoon){
			if(_ammobile){
				if(document.getElementById('htmlvid').paused){
					document.getElementById('htmlvid').pause();
				} else {
					document.getElementById('htmlvid').pause();
				}
			} else {
				jwplayer("vidin").pause();
			}
    	}
    }
 	});
 
 
 	$("#lg_fs").click(function () {
 		if(!_fson){
			var docElm = document.getElementById("legacy_container");
			if (docElm.requestFullscreen) {
				docElm.requestFullscreen();
			}
			else if (docElm.mozRequestFullScreen) {
				docElm.mozRequestFullScreen();
			}
			else if (docElm.webkitRequestFullScreen) {
				docElm.webkitRequestFullScreen();
			}
			_fson = true;
		} else {
			fullscreen_off();
		}
		// log that they did this
		if(ga){
			var mobilereport = (_ammobile)? 'mobile':'desktop';
			ga('send', 'event', 'legacy', 'fullscreen on', mobilereport);
		}

 	});
 

});

function fullscreen_off() {
	if (document.cancelFullScreen) {
		document.cancelFullScreen();
	}
	else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	}
	else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	}
	_fson = false;
}


function startscreen () {

	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31;
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	w += 54;
	vtop -= 47;
	h += 110;
	_starton = true;
	
	render_lines(1);

	$("#legstart").css({ 'width': w + 'px', 'height': h + 'px', 'padding-top': ((h / 2) - 20) + 'px' });
	_legstarton = true;
	
//	$("#linegroup").hide();
//	$("#linegroup_connections").hide();
	
	
	$("#legacy_startspace").css({ 'width': w + 'px', 'margin-top': vtop, 'margin-left':  _mladjust + 'px', 'height': h + 'px' }).fadeIn();

	var denom = (w - 2) / 1280;
	var denomh = (h - 2) / 407;

	$("#legstarter").css({ 'transform-origin': '0 0', '-webkit-transform-origin': '0 0',  'transform': 'scale(' + denom + ',' + denomh + ');', '-ms-transform': 'scale(' + denom + ',' + denomh + ')', '-webkit-transform': 'scale(' + denom + ',' + denomh + ')' });
	$("#vid_0t").css({ 'width': (w - 500), 'top': 12, 'left': (w/2) - ((w - 500) / 2) }).fadeIn(2000);
	$("#vid_1t").css({ 'width': 450, 'top': 30, 'left': (w - 510), 'top' : ((h/2) - 100) }).fadeIn(2000);
	$("#vid_2t").css({ 'width': (w - 500), 'top': (h - 240) , 'left': (w/2) - ((w - 500) / 2) }).fadeIn(2000);
	$("#vid_3t").css({ 'width': 450, 'left': 20, 'top' : ((h/2) - 100) }).fadeIn(2000);
	
	$(".legstarttheme").fadeIn();
	$(".legthemea:first").css({ 'margin-left': (_mladjust - 15) + 'px', 'margin-top': (vtop - 15) + 'px' });
	$(".legthemeb:first").css({ 'margin-left': (_mladjust - 22 + w) + 'px', 'margin-top': (vtop - 15) + 'px' });
	$(".legthemec:first").css({ 'margin-left': (_mladjust - 22 + w) + 'px', 'margin-top': ((h + vtop) - 20) + 'px' });
	$(".legthemed:first").css({ 'margin-left': (_mladjust - 15) + 'px', 'margin-top': ((h + vtop) - 20) + 'px' });
	
	$(".leg_text").mouseover(function () {
		if(_legstarton){
			_legstarton = false;
			$("#legstart").hide();
		}
		$("#vid_" + $(this).attr('data-clipid')).removeClass('grey');
	});

	$(".leg_text").mouseout(function () {
		$("#vid_" + $(this).attr('data-clipid')).addClass('grey');
	});
	
	$(".legstarttheme").mouseover(function () {
		start_linehighlights($(this).attr('data-theme'));
	});
	
	$(".legstarttheme").mouseout(function () {
		start_linehighlightsoff();
	});
	
	
	$(".leg_text").click(function () {
		if(audioactive){
			audiostop();
		}
		
		_starton = false;
		curvid = parseInt($("#vid_" + $(this).attr('data-clipid')).attr('data-clip'));
		actualclip = $("#vid_" + $(this).attr('data-clipid')).attr('data-clipname');

		var w = ($("#legacy_container").width() - _adjuster);
		var h = ($("#legacy_container").width() - _adjuster) * .31;
		var vtop = (($("#legacy_container").height() - h) / 2) - 20;

		$("#legacy_startspace").fadeOut(2000);
		$(".legstarttheme").fadeOut();
		$(".leg_text").hide().unbind('click');

		drawvideo(actualclip);
		render_lines(0);
		
		linemanager();
		
		if(legacy_debug){
			// debug_listvideo();
		}
		
		
		// set the playback x and y
				
		switch(curvid){
			case 0:
				_playbackx = 4;
				_playbacky = 4;
				break;
			case 1:
				_playbackx = w + 54;
				_playbacky = 4;
				break;
			case 2:
				_playbackx = w + 54;
				_playbacky = (h+111);
				break;
			case 3:
				_playbackx = 4;
				_playbacky = (h+111);
				break;
		}
	});
}


function start_linehighlights (theme) {
	// highlight everything in this theme
	$(".leg_text").hide();
	$(".tml" + theme).each(function () {
		var thiscl = $(this).attr('class');
		var replstring = ($(this).attr('data-superflous') == 1)? 'transition_unused_superfluous ':'transition_unused ';
		thiscl = thiscl.replace(replstring,'transition_used ');
		$(this).attr('class',thiscl);
	});
}

function start_linehighlightsoff (theme) {
	$(".leg_text").show();
	$(".transition_used").each(function () {
		var thiscl = $(this).attr('class');
		var replstring = ($(this).attr('data-superflous') == 1)? 'transition_unused_superfluous':'transition_unused';
		thiscl = thiscl.replace('transition_used',replstring);
		$(this).attr('class',thiscl);
	});
}

function endscreen (theme,focus) {

	// endscreen

	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31;
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	var ml = _mladjust - 3;
	w += 54;
	vtop -= 47;
	h += 110;
	
	// log that they got to the end here
	if(ga){
		var mobilereport = (_ammobile)? 'mobile':'desktop';
		ga('send', 'event', 'legacy', 'endscreen', mobilereport, theme);
	}
	
	$("#videotransition").remove();
	
	$("#endscreen_outer").css({ 'width': w + 'px', 'margin-top': vtop, 'margin-left': _mladjust + 'px', 'height': h + 'px' });

	$("#endscreen").append('<div id="group0" class="grey endscreen' + theme + '0" ></div>');
	$("#endscreen").append('<div id="group1" class="grey endscreen' + theme + '1" ></div>');
	$("#endscreen").append('<div id="group2" class="grey endscreen' + theme + '2" ></div>');
	$("#endscreen").append('<div id="group3" class="grey endscreen' + theme + '3" ></div>');
	$("#endscreen").append('<div id="group0a" class="color endscreen' + theme + '0" style="display: none;"></div>');
	$("#endscreen").append('<div id="group1a" class="color endscreen' + theme + '1" style="display: none;"></div>');
	$("#endscreen").append('<div id="group2a" class="color endscreen' + theme + '2" style="display: none;"></div>');
	$("#endscreen").append('<div id="group3a" class="color endscreen' + theme + '3" style="display: none;"></div>');
	$("#legacy_containerinner").append('<div id="endtalk"><div id="endtalkinner"><p>This the way you moved through the world.</p><p>But there are other ways</p><p id="legrestart" style="display: none">Start again</p></div></div>');
	var denom = (w - 2) / 1280;
	var denomh = (h - 2) / 407;


	$("#endtalk").css({'width': w + 'px',  'margin-top': vtop, 'margin-left': _mladjust + 'px', 'height': h + 'px'  });
	$("#endtalkinner").css({ 'margin-top': ((h / 2) - 60) });
	
	$("#endscreen").css({ 'transform-origin': '0 0', '-webkit-transform-origin': '0 0',  'transform': 'scale(' + denom + ',' + denomh + ');', '-ms-transform': 'scale(' + denom + ',' + denomh + ')', '-webkit-transform': 'scale(' + denom + ',' + denomh + ')' });
		
//	$("#endscreen").fadeIn(4000, function () {
	$("#group" + focus + "a").fadeTo(5000,.8);
	$("#endtalk").fadeIn(2000, function () {
			$("#legrestart").fadeIn(6000);
			$("#endtalk").click(restarter);
	});

//	});
	_endscreenon = true;
	
	
	render_lines(2, { 'w':$("#endscreen").width() ,'h':$("#endscreen").height(),'vtop':vtop,'ml':ml });

	$("#endscreen_outer").show();

} 

function restarter () {

	// god help me, reset it all
	
	$("#endtalk").fadeOut(2000, function () { $("#endtalk").remove() });
	$("#videoplayer").hide();
	$("#icongroup").fadeOut(1000);

	_scrubwidth = 0;
	_scrubheight = 0;
	_highlight_curvid = 0;
	_highlight_curpt = 0;
	_highlight_currentx = 0;
	_videoon = false;
	_endscreenon = false;
	_svglevel = false;
	_fson = false;
	_curw = new Number();
	_playbackx =0;
	_playbacky = 0;
	_clipoffsetfromstart = 0;
	_clipstartsincemove = 0;
	_playbackctr = 90;
	_intransition = false;
	_hasended = false;
	_intransitions = 0;
	litlines = {};
	liticons = {};
	gonelines = {};
	gonescrubbers = {};
	segmentsseen.length = 0;
	
	preventdoublejump = false;

	curvid = 0;
	curplayback = 0;
	curstart = 0;

	videotimes.length = 0;
	vidjumpcnt = 0;
	segmentsseen.length = 0;
	themetrack = { 'a':0, 'b':0, 'c':0, 'd':0, 'e':0 };
	usage = {};


	$("#endscreen_outer").fadeOut(1000, function () {
		$("#endscreen").html();
		startscreen();
	});

}


function render_lines (mode,spatial){

	// build the matrix of playback and connecting lines

	superfluouslinecheck = {};
	$("#icongroup").html('');
	
	var h, vtop, w;

	h = ($("#legacy_container").width() - _adjuster) * .31;  // video height
	vtop = (($("#legacy_container").height() - h) / 2) - 50; // top of video space
	w = ($("#legacy_container").width() - _adjuster); // video width;
	ml = _mladjust - 3;
	_scrubwidth = w + 54;
	_scrubheight = h + 110;
	_scrubtop = vtop - 50;


	if(mode == 2){
		h = spatial.h;
		vtop = spatial.vtop;
		w = spatial.w;
		ml = spatial.ml;
	}
	
		
	_curw = w;



	cliprect[0] = '3 5 ' + (w + 52) + ' 45';
	cliprect[1] = '4 50 21 ' + (h * .9);
	cliprect[2] = (w + 25) + ' 50 28 ' + (h * .9);
	cliprect[3] = '3 ' + ((h * .9) + 50) + ' ' + (w + 52) + ' ' + (_scrubheight - ((h * .9) + 50));
	
	// create a raphael object on the div I made for lines

	if(paper){
		paper.remove();
	}

	if(paper_connections){
		paper_connections.remove();
	}

	$("#linegroup").css({ 'margin-top': _scrubtop + 'px', 'margin-left': ml});
	$("#linegroup_connections").css({ 'margin-top': _scrubtop + 'px', 'margin-left': ml});

	$("#icongroup").css({ 'margin-top': (_scrubtop - 15) + 'px', 'width': (_scrubwidth + 30), 'height': (_scrubheight + 32), 'margin-left': (ml - 15) });
		
	paper = Raphael(document.getElementById("linegroup"), _scrubwidth + 8, _scrubheight + 8);
	paper_connections = Raphael(document.getElementById("linegroup_connections"), _scrubwidth, _scrubheight + 8);
	
	var curx = 4;
	var cury = 4; // lines start at the top, so yeah

	for(var y = 0; y < 4; y++){ // loop through each clip now to draw the box lines
		
		var vertical = false;		
		var secpx = _scrubwidth / cliplengths[y]; // multiplier of seconds to pixels
		
		if(y == 1 || y == 3){
			vertical = true;
			secpx = (_scrubheight - 8) / cliplengths[y]; // multiplier of seconds to pixels if it's vertical
		}
		
		
		// traverse the starts to put them in order
		
		var segendar = new Array();
		var segendar_start = new Array();

		for(clip in clipstarts[y]){
			segendar_start.push(parseInt(clip));
		}
		
		
		segendar_start = segendar_start.sort(function(a,b){return a-b});

		// run through the array to find gaps and close them

		for(var n = 0; n < segendar_start.length; n++){
			if(n == 0){
				segendar.push(0); // push an extra segment on the front of this array for the start
			}
			segendar.push(segendar_start[n]);
			if(clipdata[clipstarts[y][segendar_start[(n+1)]]] != undefined){
				// there's a segment after this one
				if(clipdata[clipstarts[y][segendar_start[(n+1)]]].start_secs > clipdata[clipstarts[y][segendar_start[n]]].segend_secs){
					segendar.push(clipdata[clipstarts[y][segendar_start[n]]].segend_secs);
				}
			}
		}
		
		// traverse those starts and build the scrubber line segments
		
				
		for(var x = 0; x < (segendar.length + 1); x++){
		
			var idcode = 'l' + y + 'start';
			var donothing = true;
			
			if(x > 0){
				if(clipstarts[y][segendar[x]] != undefined){
					idcode = 'l' + clipstarts[y][segendar[x]];
					donothing = false;
				} else {
					if(x == segendar.length){
						idcode = 'l' + y + 'end';
					} else {
						idcode = 'l' + y + 'inert' + x;
					}
				}
			}

			var drawstring = "M" + curx + ',' + cury + ' L';
	
			if(gonelines[idcode]){
				donothing = true;			
			}
			
			if(!donothing){
				var ic_classa = '<div class="icon gsoff gsactive g' + clipdata[clipstarts[y][segendar[x]]].state;
				if(liticons[idcode+'_ia']){
					ic_classa += '_on';
				}
				ic_classa += ' gsa' + clipdata[clipstarts[y][segendar[x]]].state + clipdata[clipstarts[y][segendar[x]]].substate + '" id="' + idcode + '_ia" data-clipdata="' + clipstarts[y][segendar[x]] + '" style="pointer-events: auto; ';
				if(!liticons[idcode+'_ia']){
					ic_classa += 'display: none; ';
				}
				ic_classa += ' left: ' + curx + '; top: ' + cury + '"></div>';
				$("#icongroup").append(ic_classa);
			}

			var change = 0;
			if(donothing){
				if(x == 0){
					change = clipdata[clipstarts[y][segendar[1]]].start_secs;
					clipfirst[y] = clipdata[clipstarts[y][segendar[1]]].start_secs;
				} else {
					if(clipdata[clipstarts[y][segendar[(x+1)]]]){
						if(x == 1){
							change = clipdata[clipstarts[y][segendar[x]]].segend_secs - clipdata[clipstarts[y][segendar[x]]].start_secs;
						} else {
							change = clipdata[clipstarts[y][segendar[(x+1)]]].start_secs - clipdata[clipstarts[y][segendar[(x-1)]]].segend_secs;
						}
					}
				}
			} else {
				change = clipdata[clipstarts[y][segendar[x]]].segend_secs - clipdata[clipstarts[y][segendar[x]]].start_secs;
			}
		
			if(vertical){ // vertical
				if(x == segendar.length){
					if(y == 1){
						cury = _scrubheight;
					} else {
						cury = 4;
					}
				} else {
					if(y == 1){
						cury = cury + (change * secpx);
					} else {
						cury = cury - (change * secpx);
					}
				}
			} else { // horizontal
				if(x == segendar.length){
					if(y == 0){
						curx = _scrubwidth;
					} else {
						curx = 4;
					}
				} else {
					if(y == 0){
						curx = curx + (change * secpx);
					} else {
						curx = curx - (change * secpx);
					}
				}
			}
					
			drawstring += curx + ',' + cury;
		
			if(!donothing){
				var ic_classb = '<div class="icon gsoff g' + clipdata[clipstarts[y][segendar[x]]].state;
				if(liticons[idcode+'_ib']){
					ic_classb += '_on';
				}
				ic_classb += '" id="' + idcode + '_ib" data-clipdata="' + clipstarts[y][segendar[x]] + '" style="pointer-events: auto; ';
				if(!liticons[idcode+'_ib']){
					ic_classb += 'display: none; ';
				}
				ic_classb += ' left: ' + curx + '; top: ' + cury + '"></div>';
				$("#icongroup").append(ic_classb);
			}
		
			var newpath = paper.path( drawstring );
							
			var lineclass = "scrubber ";
			if(litlines[idcode]){
				lineclass = "scrubber_seen ";
			}
			if(gonelines[idcode]){
				lineclass = "scrubber_gone ";
			}
			
			if(!donothing){
				lineclass += "g" + clipdata[clipstarts[y][segendar[x]]].state + ' og' + clipdata[clipstarts[y][segendar[x]]].state + clipdata[clipstarts[y][segendar[x]]].substate + ' pc' + y + x + ' pl' + y + clipdata[clipstarts[y][segendar[x]]].end_secs;
			} else {
				lineclass += 'pl' + y + ' pc' + y + x;
			}
	
			$(newpath.node).attr("id",idcode);
			$(newpath.node).attr("data-lineseq",x);
			if(x < segendar.length){
				$(newpath.node).attr("data-startsecs",segendar[x]);
				$(newpath.node).attr("data-endsecs",(segendar[x] + change));
			}
			$(newpath.node).attr("data-lineclip",y);
			if(!donothing){
				$(newpath.node).attr("data-pt",clipstarts[y][segendar[x]]);
			}
			$(newpath.node).attr("class",lineclass);

		}			

		
	}



		// ok, now draw the ends of each line to the corresponding start point of a linked space

		curx = 8;
		cury = 4; // lines start at the top, so yeah

		var connlineid = 0;

		for(var y = 0; y < 4; y++){ // loop through each clip now to draw the box lines

			// clip final bits - go there and then draw lines from them to other clips that have the same state + substate

			for(clip in clipedges[y]){
			
				// determine the class for each clip in there
					
				var clipclass = clipdata[clipedges[y][clip]].state + clipdata[clipedges[y][clip]].substate;
				
				// traverse everything else with this class and draw some lines;
				
				var coords = parsed($("#l" + clipedges[y][clip]).attr('d'));
				
				
				$(".og" + clipclass).each(function () {
					var id = $(this).attr('id');
					var clipid = parseInt(id.replace('l',''));
					if(id != ("l" + clipedges[y][clip])){
						var superflous = false;
						var thisclip = parsed($(this).attr('d'));
						
						var newline = "M" + coords.endx + ',' + coords.endy + 'L' + thisclip.startx + ',' + thisclip.starty;
						
						var newpath_a, newpath_b, newpath_c, newpath_d;
					
						var lineclass = "connline transition_unused tl" + clipclass + ' tml' + clipdata[clipedges[y][clip]].state;

						var lineyes = true;
			
						var trans_a = 'cl' + connlineid + '_1';
						var trans_b = 'cl' + connlineid + '_2';
						var trans_c = 'cl' + connlineid + '_3';
						var trans_d = 'cl' + connlineid + '_4';

						if(mode == 0){
							newpath_a = paper_connections.path( newline );
							newpath_a.attr({'clip-rect':cliprect[0]});

							newpath_b = paper_connections.path( newline );
							newpath_b.attr({'clip-rect':cliprect[1]});

							newpath_c = paper_connections.path( newline );
							newpath_c.attr({'clip-rect':cliprect[2]});

							newpath_d = paper_connections.path( newline );
							newpath_d.attr({'clip-rect':cliprect[3]});
	
						} else {
							newpath_a = paper_connections.path( newline );
						}
	
						if(gonelines['cl' + connlineid]){ // checking to see if this has been wiped out
							
							lineyes = false;
							
						} else {
							
							if(litlines['cl' + connlineid]){
								lineclass = "connline transition_used tl" + clipclass + + ' tml' + clipdata[clipedges[y][clip]].state;
							}
						}						


						if(lineyes){
							
							$(newpath_a.node).attr("id",trans_a);
						
							if(mode == 0){
								$(newpath_b.node).attr("id",trans_b);
								$(newpath_c.node).attr("id",trans_c);
								$(newpath_d.node).attr("id",trans_d);
							}

							$(newpath_a.node).attr("data-outbound",clipedges[y][clip]);

							if(mode == 0){
								$(newpath_a.node).attr("data-outbound",clipedges[y][clip]);
								$(newpath_b.node).attr("data-outbound",clipedges[y][clip]);
								$(newpath_c.node).attr("data-outbound",clipedges[y][clip]);
								$(newpath_d.node).attr("data-outbound",clipedges[y][clip]);
							}

							$(newpath_a.node).attr("data-inbound",clipid);

							if(mode == 0){
								$(newpath_a.node).attr("data-inbound",clipid);
								$(newpath_b.node).attr("data-inbound",clipid);
								$(newpath_c.node).attr("data-inbound",clipid);
								$(newpath_d.node).attr("data-inbound",clipid);
								if(superflous){
									$(newpath_a.node).attr("data-superflous",1);
									$(newpath_b.node).attr("data-superflous",1);
									$(newpath_c.node).attr("data-superflous",1);
									$(newpath_d.node).attr("data-superflous",1);
								}
							} else {
								if(superflous){
									$(newpath_a.node).attr("data-superflous",1);
								}
							}
						
							$(newpath_a.node).attr("class",lineclass);
							if(mode == 0){
								$(newpath_b.node).attr("class",lineclass);
								$(newpath_c.node).attr("class",lineclass);
								$(newpath_d.node).attr("class",lineclass);
							}
						}
						
					}
				
					connlineid++;
					
				});
				
			}

		}
		
	svgreset();
	
	
	$(".gsactive").click(iconclick);
//	$("#icongroup").hide();

}

function iconclick () {
	var data = clipdata[parseInt($(this).attr('data-clipdata'))];
	themetrack[data.state] = themetrack[data.state] + 1;
	
	var thisclass = 'g' + data.state;
	var lastx = _highlight_currentx;
	var windsofchange = new Array();
	windsofchange.push(lastx);
	
	// log these for later
	
	liticons[$(this).attr('id')] = 1;
	liticons['l' + _highlight_currentx +'_ib'] = 1;


	// preload the transition image


	// log that they clicked an icon
	if(ga){
		var mobilereport = (_ammobile)? 'mobile':'desktop';
		ga('send', 'event', 'legacy', 'icon click', mobilereport, data.dataid);
	}
	
	transition_load(lastx);
	_intransitions = lastx;	

	// icon changes - turn this one on, take the last one and toggle that on
		
	$(this).removeClass('gsoff').removeClass('gsactive').removeClass(thisclass).addClass(thisclass+"_on");
	$('#l' + _highlight_currentx +'_ib').removeClass('gsoff').removeClass('gsactive').removeClass(thisclass).addClass(thisclass+"_on");
	
	// get the class of these to disable them from future lighting
	
	var newclass = "gsa" + data.state;
	newclass += (data.substate)? data.substate:'';
	$(this).removeClass(newclass);
	
	$('#l' + _highlight_currentx +'_ia').removeClass(newclass).remove();
	$('#l' + _highlight_currentx +'_ib').removeClass(newclass);
	
	$("." + newclass).each(function () {
		$(this).fadeOut();
	});
	
	// get the delay
	var timeleft = (clipdata[lastx].segend_secs - curplayback);
	if(legacy_debug){
		console.log('delay of ' + timeleft + 's before execution');
	}
	
	// counter implementation
	if(Math.floor(timeleft) > 0){

		var cnttop = $(this).position().top - 36;
		var cntleft = $(this).position().left;


		switch(data.clip){
			case 0:
				cntleft -= 18;
				break;
			case 1:
				cnttop = cnttop + 36;
				cntleft += 36;
				break;
			case 2:
				cnttop = cnttop + 72;
				break;
			case 3:
				cnttop = cnttop + 36;
				cntleft -= 36;
				break;
		}
		
		$("#icongroup").append('<span class="counter" style="z-index: -5; top: ' + cnttop + '; left: ' + cntleft + '" id="cnt' + Math.floor(timeleft) + '"></span>');

	}

	$(".transition_hot").each(function () {
		if($(this).attr('data-inbound') == data.dataid && $(this).attr('data-outbound') == _highlight_currentx){
			var thiscl = $(this).attr('class');
			thiscl = thiscl.replace('transition_hot','transition_used');
			$(this).attr('class',thiscl);
			var parsers = $(this).attr('id').split('_');
			litlines[parsers[0]] = 1;
		} else {
			var thiscl = $(this).attr('class');
			thiscl = thiscl.replace('transition_hot','transition_gone');
			$(this).attr('class',thiscl);
			var parsers = $(this).attr('id').split('_');
			gonelines[parsers[0]] = 1;
			$(this).remove();
		}
	});

	// go to the next segment from the outbound clip and dump it

	var jump_clipseq = parseInt($("#l" + lastx).attr('data-lineseq'));

	if(jump_clipseq > 0){
		// go a segment back and black it out if it's not viewed
		var thiscl = $(".pc" + clipdata[lastx].clip + '' + (jump_clipseq +1) + ':first').attr('class');
		if(thiscl){
			var thisid = $(".pc" + clipdata[lastx].clip + '' + (jump_clipseq +1) + ':first').attr('id');
			if(thisid.indexOf('end') == -1){
				gonelines[thisid] = 1;
				windsofchange.push(parseInt($("#" + thisid).attr('data-pt')));
				thiscl = thiscl.replace('scrubber ','scrubber_gone ');
				$("#" + thisid + '_ia').remove();
				$("#" + thisid).attr('class',thiscl);
			}
		}
	}



	setTimeout(function () {
	
		_transitiontimer = 0;
		
		_transitiontimerIvl = setInterval(function () { _transitiontimer++ }, 1000);
		
	
		$(".counter").remove();

		// mark the last segment as done
		
		markseen(curvid,clipdata[lastx]);


		// start transition code
		
		transition_on(lastx);


		//color the lines
		
		
		
		// get the target segment

		var finalid = data.clip + '' + data.end_secs;
		
		// get the position for playback reasons
		
		var posdenus = parsed($("#l" + data.dataid).attr('d'));

		_playbackx = parseInt(posdenus.startx);
		_playbacky = parseInt(posdenus.starty);
		if(curvid == 2){
			_playbacky++;
		}

		var clipseq = parseInt($("#l" + data.dataid).attr('data-lineseq'));
		
		
		// traverse around to get adjacent clip ids and dump them, also grab idcodes for the next operation

		// set the new clip offset
				
		_clipoffsetfromstart = data.start_secs;		
		_clipstartsincemove = data.start_secs;
		

		$('path[data-lineclip="' + data.clip + '"]').each(function () {
			if(parseInt($(this).attr('data-lineseq')) < clipseq){
				var thiscl = $(this).attr('class');
				if(thiscl.indexOf('scrubber_seen') == -1){
					gonelines[$(this).attr('id')]
					thiscl = thiscl.replace('scrubber ','scrubber_gone ');
					$(this).attr('class',thiscl);
					linedestroy(parseInt($(this).attr('data-pt')));
				}
			}	
		});


		if(clipseq > 0){
			// go a segment forward and black it out if it's not viewed
			var thiscl = $(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('class');
			thiscl = thiscl.replace('scrubber ','scrubber_gone ');
			if(thiscl){
				$(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('class',thiscl);
				var getstr = $(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('id');
				if(getstr.indexOf('start') == -1){
					windsofchange.push(parseInt($("#" + getstr).attr('data-pt')));
					$("#" + getstr + '_ia').remove(); // remove inbound icons too
				}
				gonelines[getstr] = 1;
			}
		}


		// connector lines
		// high hanging fruit - anything with inbound/outbound matches


		for(var x = 0; x < windsofchange.length; x++){
			linedestroy(windsofchange[x]);
		}
		
					
		

		// actually load the video

		loadvid(data.clip,data.start_secs);


		// disable new hotpoints for ten seconds
		preventdoublejump = true;

		preventdoublejumpIvl = setTimeout(function () {
			preventdoublejump = false;
		},(_increment * 5000));

	}, (timeleft * 1000));
	
}

function dumphistory(vidtarget,startpoint){
	// routine that kills off the rest of the scrubber line when the user clicks something
	
	// first remove hotpoints that are later than this point
//	$("#scr_"+vidtarget).find(".hotpoint").each(function () { if(parseInt($(this).attr('data-start')) > startpoint){ $(this).remove() }});
	

}


function drawvideo (videoclip) {

	// initial video draw, triggered by users clicking on one of the large images

	// log that they clicked an initial thing
	if(ga){
		var mobilereport = (_ammobile)? 'mobile':'desktop';
		ga('send', 'event', 'legacy', 'initial click', mobilereport, videoclip);
	}

	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	$("#videoplayer").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': (_mladjust + 22), 'height': h + 'px' });
	
	$("#legacy_instructions").css({ 'width': w + 'px', 'height': h + 'px' });
	$("#leg1").css({ 'padding-top': ((h / 2) - 20) + 'px' });
	$("#leg2").css({ 'padding-top': ((h / 2) - 20) + 'px' });
	
	if(!_legacy_firstrun){
		if(!_ammobile){
			jwplayer('vidin').remove();
		}
		$("#videoplayer").show();
		$("#vidin").show();
	}
	
		if(_ammobile){
			var divtext = '<video src="http://s3.amazonaws.com/empireproj/hls/1000/' + videoclip + '_1000_crop.m3u8" id="htmlvid" poster="mp4/thumbs/full-' + videoclip + '-10.jpg" width="' + w + '" height="' + h + '" type="video/mpeg4" controls></video>';
			if(!_canhls){
				divtext = '<video src="http://s3.amazonaws.com/empireproj/legacy/' + videoclip + '_crop.mp4" id="htmlvid" poster="mp4/thumbs/full-' + videoclip + '-10.jpg" width="' + w + '" height="' + h + '" controls></video>';
			}
			$("#vidin").html(divtext);
			var subthis = this;
			document.getElementById('htmlvid').addEventListener('timeupdate', function () { subthis.progressrun(document.getElementById('htmlvid').currentTime); })
//			document.getElementById('htmlvid').addEventListener('playing', function () { if(_intransition){ transition_off(); } })
			document.getElementById('htmlvid').addEventListener('ended', function () { subthis._ended() })
			document.getElementById('htmlvid').addEventListener('play', vidinstructions);
		} else {
			var playeroptions = { 'controlbar.position': 'over' };
			playeroptions.allowFullScreen = false;
			playeroptions.allowscriptaccess = true;
			playeroptions.autostart = true;
			playeroptions.height = h;
			playeroptions.width = w;
			playeroptions.controlbar = 'none';
			playeroptions.streamer = _rtmpserver;
			playeroptions.file = 'legacy/' + videoclip + '_crop.mp4';
			playeroptions.skin = 'art/bekle.zip';
			swfobject.embedSWF('art/player.swf',"vidin",w,h,"9.0.115", 'art/expressInstall.swf', playeroptions, { 'wmode':'direct', 'scale':'noscale', 'salign':'tl', 'menu':false, 'allowFullScreen':false, 'allowScriptAccess':'always' }, { id:'vidin',name:'vidin', bgcolor:'#000000' });
			subthis = this;
			jwplayer("vidin").onTime(function (timobj) {
				subthis.progressrun(timobj.position);
			});
			jwplayer("vidin").onComplete(function () {
				subthis._ended();
			});
			jwplayer('vidin').onPlay(function () {
				if(legacy_debug){
					console.log('videoready');
				}
				if(_intransition){
					transition_off();
				}
			});
			jwplayer('vidin').onError(function (msg) {
				if(legacy_debug){
					console.log('jwplayer error ' + msg);
				}
			});
			
			vidinstructions();


		}



	_legacy_firstrun = false;
	

	$("#linegroup").fadeIn();
	$("#linegroup_connections").fadeIn();
	$("#icongroup").show();

	_videoon = true;
			

}

function vidinstructions () {
	if(_ammobile){
		document.getElementById('htmlvid').removeEventListener('play', vidinstructions);
		document.getElementById('htmlvid').controls = false;
	}
	$("#legacy_instructions").show();
	$("#leg1").fadeIn(500, function () {
		setTimeout(function () {
			$("#leg1").fadeOut(1000, function () {
				$("#leg2").fadeIn(1000, function () {
					setTimeout(function () { $("#leg2").fadeOut(); $("#legacy_instructions").fadeOut(1000); },4000);
				});
			});
		},4000);
	});
}

function transition_load (target) {

	$("#videotransition").hide();
	
	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	$("#videotransition").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': (_mladjust + 22), 'height': h + 'px' });
	var data = clipdata[target];
	
	var imgcode = '<img src="mp4/thumbs/full-' + clipmap[data.clip] + '-' + (data.segend_secs - 1) + '.jpg" width="' + w + '" height="' + h + '" alt="" />';
	$("#videotransition").html(imgcode);

}


function linemanager () {

//	console.log('linemanager ' + curvid);

	// look at the clip we just got, hide anything unused that's not an end
	var ismine = new Object();
	
	for(clip in clipstarts[curvid]){
		ismine[clipstarts[curvid][clip]] = true;
	}
	
	$(".connline").hide().each(function () {
		var hider = true;
		var thiscl = $(this).attr('class');
		if(thiscl.indexOf('transition_used') != -1){
			hider = false;
		} else {
			if(ismine[parseInt($(this).attr('data-outbound'))]){
				// show this one;
				hider = false;			
				if($(this).attr('data-superfluous') == 1){
					thiscl = thiscl.replace('transition_superfluous_unused','transition_unused');
					$(this).attr('class',thiscl);
				}
			}
		}
		if(hider){
			$(this).hide();
		} else {
			$(this).show();
		}
	});
}


function transition_on (target) {

	// show blurred video
	
	if(legacy_debug){
		console.log('transition on');
	}
	
	_intransition = true;
	$("#videoplayer").css({'opacity':.1});
	
	$("#videotransition").show().fadeIn(2000).addClass('blurred');
	
	
}

function transition_off () {
	if(legacy_debug){
		console.log('transition off');
	}
	_intransition = false;
	$("#videoplayer").css({'opacity':1});

	clearInterval(_transitiontimerIvl);
	
	// log that they got to the end here
	if(ga){
		var mobilereport = (_ammobile)? 'mobile':'desktop';
		ga('send', 'event', 'legacy', 'transition timing', mobilereport, _transitiontimer);
	}


	$("#videotransition").fadeOut(2000).removeClass('blurred');
}


function _ended () {

	// see if anything isn't marked right
	
	_hasended = true;
	
	garbagecollection();
	
	
	// do the video times
	
	var vidtime = new Object();
	
	vidtime.clip = curvid;
	vidtime.start = curstart;
	vidtime.end = curplayback;
	vidtime.count = vidjumpcnt;
	videotimes.push(vidtime);
	
	
	// find the clip with the most viewing so that it can be blessed with color

	var accumulator = new Object([0,0,0,0]);
	var accumulator_max = 0;
	var accumulator_highkey = 0;
	var winningtheme = 'a';
	var winningtheme_max = 0;
	
	for(var x = 0; x < videotimes.length; x++){
		accumulator[videotimes[x].clip] = accumulator[videotimes[x].clip] + (videotimes[x].end - videotimes[x].start);
	}
	
	for(var y = 0; y < 4; y++){
		if(accumulator[y] > accumulator_max){
			accumulator_max = accumulator[y];
			accumulator_highkey = y;
		}
	}

	for(theme in themetrack){
		if(themetrack[theme] > winningtheme_max){
			winningtheme_max = themetrack[theme];
			winningtheme = theme;
		}
	}

	// call the endscreen
	
	$("#vidin").hide();

	endscreen(winningtheme,accumulator_highkey);

	// throw that more button up

	$("#legmore").fadeIn();
	
	// hide the video


}


function loadvid (clip,starttime) {
	

	// set the video player to move to another moment


	curvid = clip;
	linemanager();
	
	videoclipname = $("#vid_" + clip).attr('data-clipname');
	if(_ammobile){
		if(_canhls){
			document.getElementById('htmlvid').src = 'http://s3.amazonaws.com/empireproj/hls/1000/' + videoclipname + '_1000_crop.m3u8#t=' + starttime;
		} else {
			document.getElementById('htmlvid').src = 'http://s3.amazonaws.com/empireproj/legacy/' + videoclipname + '_crop.mp4#t=' + starttime;		
		}
		_mobileseek = starttime;
		document.getElementById('htmlvid').addEventListener('canplay',seeker);
		_inseek = true;
	
	} else {
	
		jwplayer('vidin').load({ 'streamer': _rtmpserver, 'file': 'legacy/' + videoclipname + '_crop.mp4', 'start': starttime, 'autostart': true });

	}
	
}

function seeker () {	

	document.getElementById('htmlvid').currentTime = _mobileseek;	
	document.getElementById('htmlvid').play();
	document.getElementById('htmlvid').addEventListener('play',function () { if(_intransition){ transition_off();  _inseek = false; }});
//	_inseek = true;
}


function debug_listvideo () {
	for(var x = 0; x < clipdata.length; x++){
		if(clipdata[x].clip == curvid){
			console.log('clip ' + curvid + '; data id ' + x + '; start: ' + clipdata[x].start_secs + '; warn_start: ' + clipdata[x].end_secs + '; warn_end: ' + clipdata[x].segend_secs);		
		}
	}
}

function redrawing (){

	// redraw stuff on resizing

	$("#legacy_container").css({ 'width': ($(window).width() - 40) });
	
	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;

	if(_videoon){

		$("#legacy_instructions").css({ 'width': w + 'px', 'height': h + 'px' });
		$("#videoplayer").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': (_mladjust + 22), 'height': h + 'px' });
		$("#vidin").css({ 'width': w + 'px', 'height': h + 'px' });
		
		render_lines(0);
	
		linemanager();
	
		// now go back through and see what's playing, reorient playback line to that
		
		$('path[data-startsecs="' + _clipoffsetfromstart + '"]').each(function () {
			if(parseInt($(this).attr('data-lineclip')) == curvid){
				var posdenus = parsed($(this).attr('d'));
				_playbackx = parseInt(posdenus.startx);
				_playbacky = parseInt(posdenus.starty);
				if(curvid == 2){
					_playbacky++;
				}

			}			
		});
		
		
	}
	
	$("#ctn0").css({'top': (vtop - 75), 'left': ((w / 2) + 20) });
	$("#ctn1").css({'top': ((vtop + (h / 2)) - 50), 'right': 30 });
	$("#ctn2").css({'top': (vtop + h + 75), 'left': ((w / 2) + 20) });
	$("#ctn3").css({'top': ((vtop + (h / 2)) - 70), 'left': 12 });


	$("#legmore").css({ "margin-left": ($("#legacy_container").width() / 2) - 90 });

	if(_endscreenon){
		$("#endscreen_outer").css({ 'width': (w+54) + 'px', 'margin-top': (vtop - 47), 'margin-left': _mladjust + 'px', 'height': (h+110) + 'px' });
		var denom = ((w+54) - 2) / 1280;
		var denomh = ((h+110) - 2) / 407;
		$("#endscreen").css({ 'transform-origin': '0 0', '-webkit-transform-origin': '0 0',  'transform': 'scale(' + denom + ',' + denomh + ');', '-ms-transform': 'scale(' + denom + ',' + denomh + ')', '-webkit-transform': 'scale(' + denom + ',' + denomh + ')' });
		$("#endtalk").css({'width': (w+54) + 'px',  'height': (h+110) + 'px'  });
		$("#endtalkinner").css({ 'margin-top': ((h / 2) - 60) });
		render_lines(2, { 'w':$("#endscreen").width() ,'h':$("#endscreen").height(),'vtop':vtop,'ml':(_mladjust - 3) });
	}


	if(_starton){
		$("#legacy_startspace").css({ 'width': (w+54) + 'px', 'margin-top': (vtop -47), 'margin-left':  _mladjust + 'px', 'height': (h+110) + 'px' })
		var denom = ((w+54) - 2) / 1280;
		var denomh = ((h+110) - 2) / 407;
		$("#legstarter").css({ 'transform-origin': '0 0', '-webkit-transform-origin': '0 0',  'transform': 'scale(' + denom + ',' + denomh + ');', '-ms-transform': 'scale(' + denom + ',' + denomh + ')', '-webkit-transform': 'scale(' + denom + ',' + denomh + ')' });
		var thisw = (w+54);
		var thish = (h+110);
		$("#vid_0t").css({ 'width': (thisw - 500), 'top': 12, 'left': (thisw/2) - ((thisw - 500) / 2) }).fadeIn(2000);
		$("#vid_1t").css({ 'width': 450, 'top': 30, 'left': (thisw - 510), 'top' : ((thish/2) - 100) }).fadeIn(2000);
		$("#vid_2t").css({ 'width': (thisw - 500), 'top': (thish - 240) , 'left': (thisw/2) - ((thisw - 500) / 2) }).fadeIn(2000);
		$("#vid_3t").css({ 'width': 450, 'left': 20, 'top' : ((thish/2) - 100) }).fadeIn(2000);
		$(".legthemea:first").css({ 'margin-left': (_mladjust - 15) + 'px', 'margin-top': (vtop - 58) + 'px' });
		$(".legthemeb:first").css({ 'margin-left': (_mladjust - 22 + thisw) + 'px', 'margin-top': (vtop - 58) + 'px' });
		$(".legthemec:first").css({ 'margin-left': (_mladjust - 22 + thisw) + 'px', 'margin-top': ((thish + vtop) - 69) + 'px' });
		$(".legthemed:first").css({ 'margin-left': (_mladjust - 15) + 'px', 'margin-top': ((thish + vtop) - 69) + 'px' });
		render_lines(1);
		if(_legstarton){
			$("#legstart").css({ 'width': thisw + 'px', 'height': thish + 'px', 'padding-top': ((thish / 2) - 20) + 'px' });
		}
	}
}


function legacy_draw() {

	var matop = ($(".yellow:first").height() / 2) - 400; // top of the matrix
	var padtop = 84; // top of the main title
	var legbottom = 60; //offset of the bottom play button on the open screen
	
	// if($(".yellow:first").height() < 780){ // if this a wee screen
	// 	padtop = 10;
	// 	matop = 20;
	// 	legbottom = 20;
	// }
	
	$(".yellow_b").css("height",$(".yellow:first").height());
	
	$("#legacy_title").css({ 'padding-top': padtop });

	$("#mainarea").css({ "margin-top": matop });
	
	var w = ($("#legacy_container").width() - _adjuster);
	var h = ($("#legacy_container").width() - _adjuster) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;

	$("#ctn0").css({'top': (vtop - 75), 'left': ((w / 2) + 20) });
	$("#ctn1").css({'top': ((vtop + (h / 2)) - 50), 'right': 30 });
	$("#ctn2").css({'top': (vtop + h + 75), 'left': ((w / 2) + 20) });
	$("#ctn3").css({'top': ((vtop + (h / 2)) - 70), 'left': 12 });

	$("#legplay").css({ "bottom": legbottom, "margin-left": ($("#legacy_container").width() / 2) - 50 }).fadeIn(4000);
	$("#legmore").css({ "margin-left": ($("#legacy_container").width() / 2) - 90 });

}


function progressrun (inf) {
	// update the play bar during playback, also deal with the highlighting

	if(!_inseek){

		curplayback = inf;


		// play bar bit

		var reverse = false;
		var vertical = false;
		var playstring = new String();

		playstring = 'M' + _playbackx + ',' + _playbacky + 'L';

		var secpx = _scrubwidth / cliplengths[curvid];
		if(curvid == 1 || curvid == 3){
			secpx = (_scrubheight - 8) / cliplengths[curvid];
			vertical = true;
		}
		if(curvid == 2 || curvid == 3){
			reverse = true;
		}


		var w = ($("#legacy_container").width() - _adjuster);
		var h = ($("#legacy_container").width() - _adjuster) * .31


		// draw a line from the current x/y to this point in time

		var desiredlength = (curplayback - _clipoffsetfromstart) * secpx;

		if(vertical){
			if(reverse){
				playstring += _playbackx + ',' + (_playbacky - desiredlength);
			} else {
				playstring += _playbackx + ',' + (_playbacky + desiredlength);
			}
		} else {
			if(reverse){
				playstring += (_playbackx - desiredlength) + ',' + _playbacky;
			} else {
				playstring += (_playbackx + desiredlength) + ',' + _playbacky;
			}
		}

		if(drawpath){
			drawpath.remove();
		}


		drawpath = paper.path( playstring );
	
		drawpath.attr({'arrow-end': 'classic-wide-long', 'stroke': '#fbb03b' });
		$(drawpath.node).attr("class","playback");

		var thistime = Math.floor(inf);

		// now look for times to light up other options

		if((clipends[curvid][thistime] != undefined) && !clipdata[clipends[curvid][thistime]].fired && !preventdoublejump){

			// we have a point! light stuff up

			_highlight_curvid = curvid;
			_highlight_curpt = thistime;
			_highlight_currentx = clipends[curvid][thistime];
	
			clipdata[clipends[curvid][thistime]].fired = true;
	
			$("#l" + clipends[curvid][thistime] + "_ib").fadeIn();
	

			$(".gsa" + clipdata[clipends[curvid][thistime]].state + clipdata[clipends[curvid][thistime]].substate).each(function () {
				if($(this).attr('id') != "l" + clipends[curvid][thistime] + '_ia'){
					$(this).fadeIn();
					var thisdatapoint = clipdata[parseInt($(this).attr('data-clipdata'))];
					if(!($("#ctn" + thisdatapoint.clip).hasClass('cnameon'))){
						$("#ctn" + thisdatapoint.clip).addClass('cnameon');
					}
				}
			});

			$(".tl" + clipdata[clipends[curvid][thistime]].state + clipdata[clipends[curvid][thistime]].substate).each(function () {
				var thiscl = $(this).attr('class');
				if($(this).attr('data-outbound') == clipends[curvid][thistime]){
					if(thiscl.indexOf('transition_unused') != -1){
						var replstring = ($(this).attr('data-superflous') == 1)? 'transition_unused_superfluous':'transition_unused';
						thiscl = thiscl.replace(replstring,'transition_hot');
						$(this).attr('class',thiscl);
					}
				}
			});

	
		}
		if(clipstarts[curvid][thistime] != undefined){

			_clipoffsetfromstart = thistime;	

			var posdenus = parsed($("#l" + clipstarts[curvid][thistime]).attr('d'));	
			_playbackx = parseInt(posdenus.startx);
			_playbacky = parseInt(posdenus.starty);
			if(curvid == 2){
				_playbacky++;
			}

			markseen(curvid);

		}

		if(clipedges[curvid][thistime] != undefined){

			if(!clipdata[clipedges[curvid][thistime]].seen){
			
				// change this segment to viewed
				markseen(curvid,clipdata[clipedges[curvid][thistime]]);

			}

			if(clipedges[curvid][thistime] == _highlight_currentx){

				// the hot time is over


				// fade this icon if it's not selected
				if($("#l" + clipedges[curvid][thistime] + "_ib").hasClass('gsoff')){
					$("#l" + clipedges[curvid][thistime] + "_ib").fadeOut();
				}		
		
				// fade countries 
		
				$('.cnameon').removeClass('cnameon');
		
		
				// fade other icons
		
				$(".gsa" + clipdata[clipedges[curvid][thistime]].state + clipdata[clipedges[curvid][thistime]].substate).each(function () {
					if(($(this).attr('id') != "l" + clipedges[curvid][thistime] + '_ia') && $(this).hasClass('gsoff')){
						$(this).fadeOut();
					}
				});
		
				// fade connecting lines

				$(".tl" + clipdata[clipedges[curvid][thistime]].state + clipdata[clipedges[curvid][thistime]].substate).each(function () {
					var thiscl = $(this).attr('class');
					if(thiscl.indexOf('transition_hot') != -1){
						var replstring = ($(this).attr('data-superflous') == 1)? 'transition_unused_superfluous':'transition_unused';
						thiscl = thiscl.replace('transition_hot',replstring);
						$(this).attr('class',thiscl);
					}
				});

				_highlight_currentx = 0;
	
			}
	
		} else {
			if(thistime == clipfirst[curvid]){

				// this only shows up on the first playback but fucking hell is it annoying to me.
				markseen(curvid);

			}
		}

		// run a garbage collector every 10 runs of this routine
		_playbackctr--;
		if(_playbackctr == 0){
			garbagecollection();
			_playbackctr = 90;
		}	
	}
}

function garbagecollection () {

	$('path[data-lineclip="' + curvid + '"]').each(function () {
		var thiscl = $(this).attr("class");
		if(thiscl.indexOf('scrubber ') != -1){
			if(parseInt($(this).attr('data-startsecs')) >= _clipstartsincemove && curplayback > parseInt($(this).attr('data-endsecs'))){
				thiscl = thiscl.replace("scrubber ","scrubber_seen ");
				$(this).attr("class",thiscl);
				litlines[$(this).attr('id')] = 1;
			}
		}
	});
	if(_hasended){
		$("#l" + curvid + 'end')
		var thiscl = $("#l" + curvid + 'end').attr("class");
		thiscl = thiscl.replace("scrubber ","scrubber_seen ");
		$("#l" + curvid + 'end').attr("class",thiscl);
		litlines["l" + curvid + 'end'] = 1;	
	}
}


function markseen (cv,enddata){

	$('.cnameon').removeClass('cnameon');

	var finalid = new String();
	
	finalid = cv;
	var endpoint = curplayback;
	var nonclip = false;
	var thiscl, thisid;
		
	if(enddata){
	
		finalid = cv + '' + enddata.end_secs;
		endpoint = enddata.end_secs;
		enddata.seen = true;
		
		thiscl = $(".pl" + finalid + ":first").attr("class");
		thisid = $(".pl" + finalid + ":first").attr("id");
		
		linedestroy(enddata.dataid);

	} else {

		$('path[data-endsecs="' + parseInt(curplayback) + '"]').each(function () {
			if(parseInt($(this).attr('data-lineclip')) == cv){
				thisid = $(this).attr('id');
			}
		});
		
		thiscl = $('#' + thisid).attr('class');
		nonclip = true;

	}
			
	thiscl = thiscl.replace("scrubber ","scrubber_seen ");
	$("#" + thisid).attr("class",thiscl);
	litlines[thisid] = 1;
	

	segmentsseen.push({ 'video': cv, 'endpoint': endpoint, 'id': thisid });

}

function linedestroy (targetid) {
	$('path[data-outbound="' + targetid + '"]').each(function () {
		var linecl = $(this).attr('class');
		if(linecl.indexOf('transition_used') == -1){
			var parsers = $(this).attr('id').split('_');
			gonelines[parsers[0]] = 1;
			$(this).remove();
		}
	});
	$('path[data-inbound="' + targetid + '"]').each(function () {
		var linecl = $(this).attr('class');
		if(linecl.indexOf('transition_used') == -1){
			var parsers = $(this).attr('id').split('_');
			gonelines[parsers[0]] = 1;
			$(this).remove();
		}
	});
	if($("#l" + targetid + "_ia").hasClass('gsoff')){
		$("#l" + targetid + "_ia").remove();
	}
	if($("#l" + targetid + "_ib").hasClass('gsoff')){
		$("#l" + targetid + "_ib").remove();
	}
}

function svgreset () {

	// reset the svg layer raphael is using
		
	if(!_svglevel){
		$("svg:first").css({ "z-index":3 });	
		_svglevel = true;
	}
	
}


function parsed (d) {

	// helper routine to deconstruct path data from svg paths
	
	var retobj = new Object();
	var start = d.split('L');
	start[0] = start[0].replace('M','');	
	var starta = start[0].split(',');
	var startb = start[1].split(',');
	
	retobj.startx = starta[0];
	retobj.starty = starta[1];
	retobj.endx = startb[0];
	retobj.endy = startb[1];
	
	return retobj;
	
}


function timetosecs (instring) {
	
	// helper routine to let them do MM:SS in the data and make it work for me in seconds

	var secs = new Number();
	var bits = instring.split(':');
	secs = parseInt(bits[0]) * 60;
	secs += parseInt(bits[1]);
	return secs;
}
